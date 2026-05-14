# PaperLens AI

PaperLens AI is a full-stack web app that helps students and early researchers understand research papers visually. Users can paste text, upload a PDF, or enter a paper URL, then receive a structured explanation with a summary, key concepts, beginner-friendly math, a paper reference, a mind map, learning cards, and related topics.

## Architecture

```text
Browser
  |
  | VITE_API_URL
  v
React + Vite frontend
  |
  | multipart/form-data / JSON
  v
Express.js API
  |
  | stores jobs, status, result JSON
  v
PostgreSQL
  |
  | background analysis
  v
PDF / URL extraction + Gemini API
```

## Stack

- Frontend: React, TypeScript, Vite, React Router, Axios
- Backend: Node.js, Express.js, Multer
- Database: PostgreSQL
- AI: Google Gemini API
- Async processing: lightweight background work with `setImmediate()` and polling
- PDF / URL processing: `pdf-parse`, Axios, Cheerio

## Why This Architecture

The app keeps the user flow simple while separating responsibilities clearly. The frontend owns the product experience and polls job status. The Express backend owns file uploads, URL/PDF extraction, AI calls, and persistence. PostgreSQL stores the original paper text, processing state, and final structured explanation. For this assignment-sized product, a simple in-process background job is enough and avoids Redis or queue setup overhead.

## Folder Structure

```text
Nucleovir/
├── README.md
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── db/
│   │   ├── index.js
│   │   └── schema.sql
│   ├── middleware/
│   │   └── upload.js
│   ├── routes/
│   │   └── papers.js
│   └── services/
│       ├── gemini.js
│       ├── pdfExtract.js
│       └── urlFetch.js
└── frontend/
    ├── index.html
    ├── package.json
    ├── .env
    └── src/
        ├── App.tsx
        ├── main.tsx
        ├── pages/
        ├── components/
        ├── services/
        └── styles/
```

## Local Setup

### 1. Backend

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

Start the backend:

```bash
npm run dev
```

Health check:

```text
http://localhost:5000/api/health
```

Expected:

```json
{ "status": "ok", "storage": "postgres" }
```

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## API Endpoints

### Health

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "storage": "postgres",
  "timestamp": "2026-05-14T12:57:36.332Z"
}
```

### Submit Paper

```http
POST /api/papers/upload
```

Form data:

```text
title: optional paper title
text: pasted abstract or paper text
url: paper URL
file: PDF file
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

### Check Status

```http
GET /api/papers/:id/status
```

Response:

```json
{
  "paperId": "uuid",
  "status": "processing",
  "progress": 55,
  "error": null
}
```

### Get Result

```http
GET /api/papers/:id
```

Response shape:

```json
{
  "id": "uuid",
  "status": "completed",
  "title": "Attention Is All You Need",
  "summary": "One sentence explanation",
  "category": "Natural Language Processing",
  "difficulty": "Intermediate",
  "method": "Self-attention and Transformer layers",
  "concepts": ["Transformer", "Self-attention"],
  "equations": [{ "equation": "...", "explanation": "..." }],
  "mindMap": { "nodes": ["Main idea"], "connections": [] },
  "learningCards": [{ "question": "...", "answer": "..." }],
  "relatedTopics": ["Large language models"]
}
```

### Retry

```http
POST /api/papers/:id/retry
```

## AI Prompt

The full prompt lives in `backend/services/gemini.js` as `ANALYSIS_PROMPT`. It instructs Gemini to return one valid JSON object with:

- `summary`
- `concepts`
- `math`
- `mindMap`
- `learningCards`
- `relatedTopics`

The backend parses this JSON and adapts it into the frontend result page.

## Async Processing

1. The frontend submits a paper and receives `paperId`.
2. The backend creates a PostgreSQL row with `pending` status.
3. `setImmediate()` starts extraction and AI analysis after the HTTP response.
4. The backend updates progress and stores the final JSON result.
5. The frontend polls `/api/papers/:id/status` every 2 seconds.
6. When status becomes `completed`, the frontend opens `/explanation/:paperId`.

## Known Limitations

- The frontend is built with React + Vite instead of Next.js because of time constraints.
- arXiv pages cannot be embedded in an iframe, so the app shows an external source card.
- The background worker is in-process; production deployments should use Redis/BullMQ or another queue.
- Gemini output quality depends on API availability and model access.
- PDF extraction works best for text-based PDFs, not scanned documents.

## Future Improvements

- Migrate frontend to Next.js App Router.
- Add Redis-backed queue processing.
- Add generated PDF thumbnails.
- Add chat with paper.
- Add quiz mode and export summary as PDF.
- Add user history and search.
