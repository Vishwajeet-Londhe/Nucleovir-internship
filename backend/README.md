# PaperLens AI Backend

Express.js backend for PaperLens AI. It accepts paper input, extracts text, sends content to Gemini, stores status and results in PostgreSQL, and exposes the API consumed by the frontend.

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Google Gemini API
- Multer for PDF upload
- `pdf-parse` for PDF text extraction
- Axios + Cheerio for paper URL extraction

## Setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/paperlens
GEMINI_API_KEY=YOUR_GEMINI_KEY
GEMINI_MODEL=gemini-2.5-flash
NODE_ENV=development
```

Set up PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE paperlens;"
psql -U postgres -d paperlens -f db/schema.sql
```

Start backend:

```bash
npm run dev
```

Health check:

```text
http://localhost:5000/api/health
```

## Folder Structure

```text
backend/
├── server.js
├── package.json
├── .env
├── db/
│   ├── index.js
│   └── schema.sql
├── middleware/
│   └── upload.js
├── routes/
│   └── papers.js
└── services/
    ├── gemini.js
    ├── pdfExtract.js
    └── urlFetch.js
```

## API Endpoints

### `GET /api/health`

Returns backend health and active storage mode.

```json
{
  "status": "ok",
  "storage": "postgres",
  "timestamp": "2026-05-14T12:57:36.332Z"
}
```

### `POST /api/papers/upload`

Submits a paper for analysis. Use multipart form data.

Fields:

```text
title  optional
text   pasted abstract or paper text
url    paper URL
file   PDF file
```

Response:

```json
{
  "message": "Paper submitted. Analysis started.",
  "paperId": "uuid",
  "status": "pending",
  "progress": 5
}
```

### `GET /api/papers/:id/status`

Returns the current job status.

```json
{
  "paperId": "uuid",
  "status": "processing",
  "progress": 55,
  "error": null
}
```

### `GET /api/papers/:id`

Returns the frontend-ready result object.

```json
{
  "id": "uuid",
  "status": "completed",
  "title": "Paper title",
  "summary": "One-line summary",
  "category": "NLP",
  "difficulty": "Intermediate",
  "method": "Method used",
  "concepts": ["Concept"],
  "equations": [],
  "mindMap": { "nodes": [], "connections": [] },
  "learningCards": [],
  "relatedTopics": []
}
```

### `POST /api/papers/:id/retry`

Retries a failed or completed analysis using the stored raw text.

## Async Processing

The backend creates a paper row with `pending` status and returns immediately. It then starts analysis using `setImmediate()`, updates progress, calls Gemini, and stores the completed result. The frontend polls `/api/papers/:id/status` until the status becomes `completed` or `failed`.

## AI Prompt

The exact prompt is defined in `services/gemini.js` as `ANALYSIS_PROMPT`. It asks Gemini to return only valid JSON with this structure:

```json
{
  "summary": {
    "title": "...",
    "category": "...",
    "difficulty": "...",
    "oneLiner": "...",
    "problemSolved": "...",
    "methodUsed": "..."
  },
  "concepts": ["..."],
  "math": {
    "hasEquation": true,
    "equation": "...",
    "equationMeaning": "...",
    "symbols": [{ "symbol": "...", "meaning": "..." }],
    "steps": ["..."],
    "humanExplanation": "..."
  },
  "mindMap": {
    "root": "...",
    "children": []
  },
  "learningCards": [{ "question": "...", "answer": "..." }],
  "relatedTopics": ["..."]
}
```

## Database

Schema file:

```text
db/schema.sql
```

Main table:

```text
papers
```

Stores title, input type, raw extracted text, source URL, PDF URL, status, progress, error message, result JSON, and timestamps.

## Notes

- Keep `backend/.env` private.
- The backend includes an in-memory fallback for local development, but PostgreSQL is the expected storage mode.
- Direct arXiv abstract URLs are extracted using the arXiv page content.
- Direct PDF URLs are downloaded and parsed using `pdf-parse`.
