const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const memoryPapers = new Map();
const shouldUseMemory = process.env.USE_MEMORY_STORE === 'true' || !process.env.DATABASE_URL;

let mode = shouldUseMemory ? 'memory' : 'postgres';
let pool = null;
let fallbackLogged = false;

if (mode === 'postgres') {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
  });

  pool.on('connect', () => console.log('PostgreSQL connected'));
  pool.on('error', (err) => console.error('PostgreSQL error:', err.message));
} else {
  console.log('Using in-memory paper store');
}

function now() {
  return new Date().toISOString();
}

function normalizeRecord(row) {
  if (!row) return null;

  return {
    id: row.id,
    title: row.title,
    input_type: row.input_type,
    raw_text: row.raw_text,
    source_url: row.source_url,
    pdf_url: row.pdf_url,
    status: row.status,
    progress: Number(row.progress ?? deriveProgress(row.status)),
    error_message: row.error_message,
    result: typeof row.result === 'string' ? safeJsonParse(row.result) : row.result,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function deriveProgress(status) {
  if (status === 'completed') return 100;
  if (status === 'processing') return 60;
  if (status === 'failed') return 100;
  return 5;
}

async function runDb(operation) {
  if (mode !== 'postgres' || !pool) return null;

  try {
    return await operation();
  } catch (err) {
    mode = 'memory';
    if (!fallbackLogged) {
      console.warn(`PostgreSQL unavailable (${err.message}). Falling back to in-memory store.`);
      fallbackLogged = true;
    }
    return null;
  }
}

function createMemoryPaper({ title, inputType, rawText, sourceUrl, pdfUrl }) {
  const timestamp = now();
  const paper = normalizeRecord({
    id: uuidv4(),
    title: title || null,
    input_type: inputType,
    raw_text: rawText,
    source_url: sourceUrl || null,
    pdf_url: pdfUrl || null,
    status: 'pending',
    progress: 5,
    error_message: null,
    result: null,
    created_at: timestamp,
    updated_at: timestamp,
  });

  memoryPapers.set(paper.id, paper);
  return paper;
}

async function createPaper({ title, inputType, rawText, sourceUrl, pdfUrl }) {
  const dbResult = await runDb(() => pool.query(
    `INSERT INTO papers (title, input_type, raw_text, source_url, pdf_url, status, progress)
     VALUES ($1, $2, $3, $4, $5, 'pending', 5)
     RETURNING id, title, input_type, raw_text, source_url, pdf_url, status,
               progress, error_message, result, created_at, updated_at`,
    [title || null, inputType, rawText, sourceUrl || null, pdfUrl || null]
  ));

  if (dbResult) return normalizeRecord(dbResult.rows[0]);
  return createMemoryPaper({ title, inputType, rawText, sourceUrl, pdfUrl });
}

async function getPaper(id) {
  const dbResult = await runDb(() => pool.query(
    `SELECT id, title, input_type, raw_text, source_url, pdf_url, status,
            progress, error_message, result, created_at, updated_at
     FROM papers
     WHERE id = $1`,
    [id]
  ));

  if (dbResult) return normalizeRecord(dbResult.rows[0]);
  return memoryPapers.get(id) || null;
}

async function updatePaper(id, updates) {
  const fields = [];
  const values = [];
  const columnMap = {
    title: 'title',
    status: 'status',
    progress: 'progress',
    result: 'result',
    errorMessage: 'error_message',
    rawText: 'raw_text',
    sourceUrl: 'source_url',
    pdfUrl: 'pdf_url',
  };

  for (const [key, value] of Object.entries(updates)) {
    const column = columnMap[key];
    if (!column) continue;

    values.push(column === 'result' ? JSON.stringify(value) : value);
    fields.push(`${column} = $${values.length}`);
  }

  if (fields.length) {
    values.push(id);
    const dbResult = await runDb(() => pool.query(
      `UPDATE papers
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${values.length}
       RETURNING id, title, input_type, raw_text, source_url, pdf_url, status,
                 progress, error_message, result, created_at, updated_at`,
      values
    ));

    if (dbResult) return normalizeRecord(dbResult.rows[0]);
  }

  const paper = memoryPapers.get(id);
  if (!paper) return null;

  const memoryUpdates = {};
  if ('title' in updates) memoryUpdates.title = updates.title;
  if ('status' in updates) memoryUpdates.status = updates.status;
  if ('progress' in updates) memoryUpdates.progress = updates.progress;
  if ('result' in updates) memoryUpdates.result = updates.result;
  if ('errorMessage' in updates) memoryUpdates.error_message = updates.errorMessage;
  if ('rawText' in updates) memoryUpdates.raw_text = updates.rawText;
  if ('sourceUrl' in updates) memoryUpdates.source_url = updates.sourceUrl;
  if ('pdfUrl' in updates) memoryUpdates.pdf_url = updates.pdfUrl;

  const updated = normalizeRecord({ ...paper, ...memoryUpdates, updated_at: now() });
  memoryPapers.set(id, updated);
  return updated;
}

async function listPapers(limit = 20) {
  const dbResult = await runDb(() => pool.query(
    `SELECT id, title, input_type, source_url, pdf_url, status,
            progress, error_message, result, created_at, updated_at
     FROM papers
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  ));

  if (dbResult) return dbResult.rows.map(normalizeRecord);

  return Array.from(memoryPapers.values())
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, limit);
}

async function end() {
  if (pool) await pool.end();
}

module.exports = {
  createPaper,
  getPaper,
  updatePaper,
  listPapers,
  end,
  getMode: () => mode,
};
