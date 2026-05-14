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

function extractAbstract(text) {
  const abstractMatch = text.match(/abstract[:\s]+(.{120,1400}?)(?:introduction|keywords|1\s+introduction|$)/i);
  return (abstractMatch?.[1] || text).replace(/\s+/g, ' ').trim();
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
    'Self-attention',
    'Multi-head attention',
    'Positional encoding',
    'Machine translation',
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
  const abstract = extractAbstract(normalized);
  const lower = normalized.toLowerCase();
  const isTransformerPaper = lower.includes('attention is all you need') || lower.includes('transformer');
  const hasAttentionEquation = isTransformerPaper || lower.includes('softmax') || lower.includes('qk');

  return {
    summary: {
      title,
      category: isTransformerPaper ? 'Natural Language Processing' : 'Research',
      difficulty: 'Intermediate',
      oneLiner: isTransformerPaper
        ? 'The paper introduces the Transformer, a faster sequence model built around attention instead of recurrence or convolution.'
        : abstract.slice(0, 260),
      problemSolved: isTransformerPaper
        ? 'It solves the problem of slow, hard-to-parallelize sequence transduction models used for tasks like machine translation.'
        : 'It addresses the central research problem described in the paper and explains why the proposed method matters.',
      methodUsed: isTransformerPaper
        ? 'The method uses self-attention, multi-head attention, positional encodings, and feed-forward layers.'
        : 'The paper proposes a structured method and evaluates it through the evidence described in the text.',
    },
    concepts: isTransformerPaper
      ? ['Transformer', 'Self-attention', 'Multi-head attention', 'Positional encoding', 'Machine translation', 'Sequence modeling']
      : concepts,
    math: {
      hasEquation: hasAttentionEquation,
      equation: hasAttentionEquation ? 'Attention(Q, K, V) = softmax(QK^T / sqrt(d_k))V' : '',
      equationMeaning: hasAttentionEquation
        ? 'The equation scores how strongly each token should attend to every other token, then mixes the value vectors using those scores.'
        : '',
      symbols: hasAttentionEquation
        ? [
            { symbol: 'Q', meaning: 'query vectors representing what each token is looking for' },
            { symbol: 'K', meaning: 'key vectors representing what each token offers for matching' },
            { symbol: 'V', meaning: 'value vectors containing the information to pass forward' },
            { symbol: 'd_k', meaning: 'the key vector size, used to keep scores numerically stable' },
          ]
        : [],
      steps: hasAttentionEquation
        ? [
            'Compare queries with keys using QK^T.',
            'Scale the scores by sqrt(d_k) so they do not become too large.',
            'Use softmax to turn scores into attention weights.',
            'Multiply those weights by V to blend useful information from other tokens.',
          ]
        : [],
      humanExplanation: hasAttentionEquation
        ? 'Each word asks which other words matter most. Attention gives every word a weighted mix of information from the rest of the sentence.'
        : 'No major mathematical equation was confidently extracted from the available text.',
    },
    mindMap: {
      root: title,
      children: [
        { label: 'Problem', children: [{ label: isTransformerPaper ? 'Slow recurrent sequence models' : 'What the paper tries to solve' }] },
        { label: 'Method', children: [{ label: isTransformerPaper ? 'Self-attention layers' : 'How the paper approaches the problem' }] },
        { label: 'Evidence', children: [{ label: isTransformerPaper ? 'Machine translation benchmarks' : 'Experiments, examples, or arguments' }] },
        { label: 'Applications', children: [{ label: isTransformerPaper ? 'Language models and translation systems' : 'Related real-world use cases' }] },
      ],
    },
    learningCards: [
      {
        question: 'What problem does this paper solve?',
        answer: isTransformerPaper
          ? 'It makes sequence modeling faster and more parallelizable by replacing recurrence with attention.'
          : 'It focuses on the central research problem described in the text and explains why that problem matters.',
      },
      {
        question: 'What is the main idea?',
        answer: isTransformerPaper
          ? 'The main idea is that tokens can understand context by directly attending to other tokens instead of processing one step at a time.'
          : 'The main idea is to use the paper method to make the problem easier to solve or understand.',
      },
      {
        question: 'Why does the method work?',
        answer: isTransformerPaper
          ? 'Self-attention lets the model connect distant words directly, while multi-head attention learns several relationship types at once.'
          : 'The method works by organizing the input information, applying a repeatable approach, and checking results against evidence.',
      },
      {
        question: 'Where can this be applied?',
        answer: isTransformerPaper
          ? 'It applies to translation, summarization, search, chatbots, code models, and many modern language systems.'
          : 'It can be applied in related research or engineering settings where similar data, models, or evaluation goals appear.',
      },
      {
        question: 'What should I learn next?',
        answer: `Start with ${(isTransformerPaper ? ['self-attention', 'embeddings', 'positional encoding'] : concepts.slice(0, 3)).join(', ')} and then read the paper's experiments section.`,
      },
    ],
    relatedTopics: isTransformerPaper
      ? ['Transformer architecture', 'Self-attention', 'Embeddings', 'Sequence modeling', 'Large language models']
      : concepts,
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
    const truncated = String(text || '').slice(0, 12000);
    const modelNames = [
      process.env.GEMINI_MODEL,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
    ].filter(Boolean);

    let lastError = null;

    for (const modelName of [...new Set(modelNames)]) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(ANALYSIS_PROMPT + truncated);
        const response = await result.response;

        return extractJson(response.text());
      } catch (err) {
        lastError = err;
        console.warn(`Gemini model ${modelName} failed: ${err.message}`);
      }
    }

    throw lastError || new Error('No Gemini model was available.');
  } catch (err) {
    console.warn(`Gemini analysis fallback used: ${err.message}`);
    return fallbackAnalysis(text, err.message);
  }
}

module.exports = { analyzePaper, ANALYSIS_PROMPT };
