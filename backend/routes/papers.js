const express = require('express');
const { URL } = require('url');

const router = express.Router();

const store = require('../db');
const upload = require('../middleware/upload');
const { extractTextFromPDF } = require('../services/pdfExtract');
const { fetchTextFromURL } = require('../services/urlFetch');
const { analyzePaper } = require('../services/gemini');

const uploadFields = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'pdf', maxCount: 1 },
]);

function handleUpload(req, res, next) {
  uploadFields(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Could not upload the file.' });
    }
    next();
  });
}

function getUploadedPdf(req) {
  return req.file || req.files?.file?.[0] || req.files?.pdf?.[0] || null;
}

function inferInputType(body, file) {
  if (['text', 'pdf', 'url'].includes(body.inputType)) return body.inputType;
  if (file) return 'pdf';
  if (body.url?.trim()) return 'url';
  if (body.text?.trim()) return 'text';
  return null;
}

function isLikelyPdfUrl(url) {
  return Boolean(url && /\.pdf($|[?#])/i.test(url));
}

function getPublicUploadUrl(req, file) {
  if (!file?.filename) return null;
  return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
}

function sanitizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function getAbstractSnippet(rawText) {
  const text = sanitizeText(rawText);
  if (!text) return '';

  const abstractMatch = text.match(/abstract[:\s]+(.{120,900}?)(?:introduction|keywords|1\s+introduction|$)/i);
  const snippet = abstractMatch?.[1] || text;
  return snippet.slice(0, 650);
}

function flattenMindMap(mindMap) {
  if (!mindMap) {
    return {
      nodes: ['Main idea', 'Problem', 'Method', 'Evidence', 'Applications', 'Next steps'],
      connections: ['Main idea -> Problem', 'Main idea -> Method', 'Method -> Evidence'],
    };
  }

  if (Array.isArray(mindMap.nodes)) {
    return {
      nodes: mindMap.nodes,
      connections: Array.isArray(mindMap.connections) ? mindMap.connections : [],
    };
  }

  const nodes = [];
  const connections = [];

  function walk(node, parentLabel) {
    if (!node) return;
    const label = node.label || node.root || String(node);
    if (!nodes.includes(label)) nodes.push(label);
    if (parentLabel) connections.push(`${parentLabel} -> ${label}`);

    if (Array.isArray(node.children)) {
      node.children.forEach((child) => walk(child, label));
    }
  }

  walk({ label: mindMap.root || 'Main idea', children: mindMap.children || [] });

  return {
    nodes: nodes.slice(0, 7),
    connections,
  };
}

function formatEquations(result) {
  if (Array.isArray(result.equations)) {
    return result.equations
      .filter((item) => item?.equation)
      .map((item) => ({
        equation: item.equation,
        explanation: item.explanation || item.equationMeaning || '',
      }));
  }

  const math = result.math || {};
  if (!math.hasEquation || !math.equation) return [];

  const explanationParts = [
    math.equationMeaning,
    Array.isArray(math.steps) ? math.steps.join(' ') : '',
    math.humanExplanation,
  ].filter(Boolean);

  return [{
    equation: math.equation,
    explanation: explanationParts.join(' '),
  }];
}

function formatPaperForFrontend(paper) {
  const result = paper.result || {};
  const summary = result.summary || {};
  const title = paper.title || summary.title || 'Untitled research paper';

  return {
    id: paper.id,
    paperId: paper.id,
    status: paper.status,
    progress: paper.progress,
    title,
    abstract: getAbstractSnippet(paper.raw_text),
    summary: summary.oneLiner || result.oneLineSummary || '',
    category: summary.category || 'Research',
    difficulty: summary.difficulty || 'Intermediate',
    method: summary.methodUsed || summary.method || 'Paper analysis',
    problemSolved: summary.problemSolved || '',
    concepts: Array.isArray(result.concepts) ? result.concepts : [],
    equations: formatEquations(result),
    math: result.math || null,
    pdfUrl: paper.pdf_url || (isLikelyPdfUrl(paper.source_url) ? paper.source_url : null),
    sourceUrl: paper.source_url,
    mindMap: flattenMindMap(result.mindMap),
    learningCards: Array.isArray(result.learningCards) ? result.learningCards : [],
    relatedTopics: Array.isArray(result.relatedTopics) ? result.relatedTopics : [],
    error_message: paper.error_message,
    created_at: paper.created_at,
    updated_at: paper.updated_at,
  };
}

function statusPayload(paper) {
  return {
    paperId: paper.id,
    status: paper.status,
    progress: paper.progress,
    error: paper.error_message,
  };
}

async function processAnalysis(paperId, text) {
  try {
    await store.updatePaper(paperId, {
      status: 'processing',
      progress: 20,
      errorMessage: null,
    });

    await store.updatePaper(paperId, { progress: 55 });

    const result = await analyzePaper(text);

    await store.updatePaper(paperId, { progress: 90 });

    await store.updatePaper(paperId, {
      status: 'completed',
      progress: 100,
      result,
      errorMessage: null,
    });

    console.log(`Analysis complete for paper ${paperId}`);
  } catch (err) {
    console.error(`Analysis failed for paper ${paperId}:`, err.message);
    await store.updatePaper(paperId, {
      status: 'failed',
      progress: 100,
      errorMessage: err.message,
    });
  }
}

async function submitPaper(req, res) {
  try {
    const file = getUploadedPdf(req);
    const inputType = inferInputType(req.body, file);
    const title = req.body.title?.trim() || null;
    const url = req.body.url?.trim() || null;
    let extractedText = '';
    let sourceUrl = null;
    let pdfUrl = null;

    if (!inputType) {
      return res.status(400).json({ error: 'Add text, a PDF file, or a paper URL.' });
    }

    if (inputType === 'text') {
      extractedText = sanitizeText(req.body.text);
      if (extractedText.length < 30) {
        return res.status(400).json({ error: 'Text is too short. Please paste more paper content.' });
      }
    }

    if (inputType === 'pdf') {
      if (!file) {
        return res.status(400).json({ error: 'No PDF file uploaded.' });
      }

      extractedText = sanitizeText(await extractTextFromPDF(file.path));
      pdfUrl = getPublicUploadUrl(req, file);
    }

    if (inputType === 'url') {
      try {
        new URL(url);
      } catch {
        return res.status(400).json({ error: 'Please provide a valid paper URL.' });
      }

      extractedText = sanitizeText(await fetchTextFromURL(url));
      sourceUrl = url;
      pdfUrl = isLikelyPdfUrl(url) ? url : null;
    }

    if (!extractedText || extractedText.length < 30) {
      return res.status(400).json({ error: 'Not enough content could be extracted from this paper.' });
    }

    const paper = await store.createPaper({
      title,
      inputType,
      rawText: extractedText.slice(0, 40000),
      sourceUrl,
      pdfUrl,
    });

    setImmediate(() => processAnalysis(paper.id, extractedText));

    return res.status(202).json({
      message: 'Paper submitted. Analysis started.',
      paperId: paper.id,
      status: paper.status,
      progress: paper.progress,
      storage: store.getMode(),
    });
  } catch (err) {
    console.error('Submit paper error:', err.message);
    return res.status(500).json({ error: err.message || 'Failed to submit paper.' });
  }
}

router.post('/upload', handleUpload, submitPaper);
router.post('/', handleUpload, submitPaper);

router.get('/:id/status', async (req, res) => {
  try {
    const paper = await store.getPaper(req.params.id);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found.' });
    }

    return res.json(statusPayload(paper));
  } catch (err) {
    console.error('GET /api/papers/:id/status error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch paper status.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const paper = await store.getPaper(req.params.id);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found.' });
    }

    return res.json(formatPaperForFrontend(paper));
  } catch (err) {
    console.error('GET /api/papers/:id error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch paper.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const papers = await store.listPapers(20);
    return res.json(papers.map(formatPaperForFrontend));
  } catch (err) {
    console.error('GET /api/papers error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch papers.' });
  }
});

router.post('/:id/retry', async (req, res) => {
  try {
    const paper = await store.getPaper(req.params.id);

    if (!paper) {
      return res.status(404).json({ error: 'Paper not found.' });
    }

    if (paper.status === 'processing') {
      return res.status(400).json({ error: 'Paper is already being processed.' });
    }

    await store.updatePaper(paper.id, {
      status: 'pending',
      progress: 5,
      errorMessage: null,
    });

    setImmediate(() => processAnalysis(paper.id, paper.raw_text));

    return res.json({
      message: 'Retry started.',
      paperId: paper.id,
      status: 'pending',
      progress: 5,
    });
  } catch (err) {
    console.error('POST /api/papers/:id/retry error:', err.message);
    return res.status(500).json({ error: 'Failed to retry analysis.' });
  }
});

module.exports = router;
