const { GoogleGenerativeAI } = require('@google/generative-ai');

const ANALYSIS_PROMPT = `
You are an expert research paper analyzer for PaperLens AI.
Analyze the research paper content below and return a SINGLE valid JSON object.

RULES:
- Return ONLY JSON. No markdown, no backticks, no text outside the JSON.
- All string values must be beginner-friendly and clear.
- If math is not present, set hasEquation to false and leave equation fields empty.

JSON structure to follow EXACTLY:

{
  "summary": {
    "title": "Full paper title, extracted from the text or generated if missing",
    "category": "Machine Learning, NLP, Computer Vision, Biology, Physics, or another useful category",
    "difficulty": "Beginner | Intermediate | Advanced",
    "oneLiner": "One sentence that sums up the paper",
    "problemSolved": "What specific problem does this paper address?",
    "methodUsed": "What technique or approach does the paper propose?"
  },
  "concepts": [
    "Key concept 1",
    "Key concept 2",
    "Key concept 3",
    "Key concept 4",
    "Key concept 5"
  ],
  "math": {
    "hasEquation": true,
    "equation": "Main equation in readable plain text or simple LaTeX",
    "equationMeaning": "What this equation computes or represents",
    "symbols": [
      { "symbol": "x", "meaning": "the input feature vector" },
      { "symbol": "W", "meaning": "learnable weight matrix" }
    ],
    "steps": [
      "Step 1: Start with the input.",
      "Step 2: Apply the transformation."
    ],
    "humanExplanation": "Explain the math as if talking to a curious beginner."
  },
  "mindMap": {
    "root": "Paper title or main idea",
    "children": [
      { "label": "Problem", "children": [{ "label": "specific issue" }] },
      { "label": "Method", "children": [{ "label": "approach detail" }] },
      { "label": "Key Results", "children": [{ "label": "main finding" }] },
      { "label": "Applications", "children": [{ "label": "use case" }] }
    ]
  },
  "learningCards": [
    {
      "question": "What problem does this paper solve?",
      "answer": "Clear 2-3 sentence answer."
    },
    {
      "question": "What is the main idea?",
      "answer": "Clear 2-3 sentence answer."
    },
    {
      "question": "Why does the method work?",
      "answer": "Clear 2-3 sentence answer."
    },
    {
      "question": "Where can this be applied in the real world?",
      "answer": "Clear 2-3 sentence answer."
    },
    {
      "question": "What should I learn next to understand this better?",
      "answer": "Clear 2-3 sentence answer."
    }
  ],
  "relatedTopics": [
    "Related Topic 1",
    "Related Topic 2",
    "Related Topic 3",
    "Related Topic 4",
    "Related Topic 5"
  ]
}

Paper content:
`;

function extractJson(rawText) {
  const cleaned = String(rawText || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response did not contain JSON.');
  }

  return JSON.parse(cleaned.slice(start, end + 1));
}

function extractTitle(text) {
  const titleLine = text.match(/title:\s*(.+?)(?:\n|authors?:|abstract:|$)/i);
  if (titleLine?.[1]) return titleLine[1].trim().slice(0, 140);

  const firstLine = text.split(/\n+/).find((line) => line.trim().length > 12);
  if (firstLine) return firstLine.trim().slice(0, 140);

  return 'Research paper analysis';
}

function detectConcepts(text) {
  const candidates = [
    'Transformers',
    'Attention',
    'Embeddings',
    'Neural networks',
    'Representation learning',
    'Optimization',
    'Evaluation',
    'Dataset',
    'Architecture',
    'Generalization',
    'Message passing',
    'Semantic search',
  ];

  const lower = text.toLowerCase();
  const matches = candidates.filter((topic) => lower.includes(topic.toLowerCase()));
  const fallback = ['Research problem', 'Method', 'Dataset', 'Evaluation', 'Limitations'];

  return Array.from(new Set([...matches, ...fallback])).slice(0, 6);
}

function fallbackAnalysis(text, reason = 'Gemini was unavailable') {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  const title = extractTitle(normalized);
  const concepts = detectConcepts(normalized);
  const summarySeed = normalized.slice(0, 240) || 'The paper presents a research idea and explains how it is evaluated.';

  return {
    summary: {
      title,
      category: 'Research',
      difficulty: 'Intermediate',
      oneLiner: `This paper studies ${summarySeed.toLowerCase()}`,
      problemSolved: 'It addresses a research problem described in the paper and explains why a structured method is useful.',
      methodUsed: 'The method is extracted from the paper text and summarized into beginner-friendly steps.',
    },
    concepts,
    math: {
      hasEquation: false,
      equation: '',
      equationMeaning: '',
      symbols: [],
      steps: [],
      humanExplanation: 'No major mathematical equation was confidently extracted from the available text.',
    },
    mindMap: {
      root: title,
      children: [
        { label: 'Problem', children: [{ label: 'What the paper tries to solve' }] },
        { label: 'Method', children: [{ label: 'How the paper approaches the problem' }] },
        { label: 'Evidence', children: [{ label: 'Experiments, examples, or arguments' }] },
        { label: 'Next steps', children: [{ label: 'Topics to learn after reading' }] },
      ],
    },
    learningCards: [
      {
        question: 'What problem does this paper solve?',
        answer: 'It focuses on the central research problem described in the text and explains why that problem matters.',
      },
      {
        question: 'What is the main idea?',
        answer: 'The main idea is to use the paper method to make the problem easier to solve or understand.',
      },
      {
        question: 'Why does the method work?',
        answer: 'The method works by organizing the input information, applying a repeatable approach, and checking results against evidence.',
      },
      {
        question: 'Where can this be applied?',
        answer: 'It can be applied in related research or engineering settings where similar data, models, or evaluation goals appear.',
      },
      {
        question: 'What should I learn next?',
        answer: `Start with ${concepts.slice(0, 3).join(', ')} and then read the paper's experiments or limitations section.`,
      },
    ],
    relatedTopics: concepts,
    fallbackReason: reason,
  };
}

async function analyzePaper(text) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackAnalysis(text, 'GEMINI_API_KEY is not configured');
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
    });

    const truncated = String(text || '').slice(0, 12000);
    const result = await model.generateContent(ANALYSIS_PROMPT + truncated);
    const response = await result.response;

    return extractJson(response.text());
  } catch (err) {
    console.warn(`Gemini analysis fallback used: ${err.message}`);
    return fallbackAnalysis(text, err.message);
  }
}

module.exports = { analyzePaper, ANALYSIS_PROMPT };
