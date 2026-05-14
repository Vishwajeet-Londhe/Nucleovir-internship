# PaperLens AI — Backend

Express.js + PostgreSQL + Google Gemini backend for PaperLens AI.

## Folder Structure

```
paperlens-backend/
├── server.js              ← Entry point
├── package.json
├── .env.example
├── db/
│   ├── index.js           ← PostgreSQL pool
│   └── schema.sql         ← Run once to create tables
├── routes/
│   └── papers.js          ← All API endpoints
├── services/
│   ├── gemini.js          ← AI analysis + prompt
│   ├── pdfExtract.js      ← PDF → text
│   └── urlFetch.js        ← URL scraping (arXiv support)
└── middleware/
    └── upload.js          ← Multer PDF upload handler
```

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment
```bash
cp .env.example .env
# Fill in your values in .env
```

### 3. Set up PostgreSQL
```bash
# Create database
psql -U postgres -c "CREATE DATABASE paperlens;"

# Run schema
psql -U postgres -d paperlens -f db/schema.sql
```

### 4. Get Gemini API key (free)
→ https://ai.google.dev/gemini-api/docs/pricing

### 5. Start the server
```bash
npm run dev     # development (nodemon)
npm start       # production
```

---

## API Endpoints

### POST /api/papers
Submit paper for analysis.

**Form data (multipart):**
| Field       | Type   | Description                        |
|-------------|--------|------------------------------------|
| inputType   | string | `text`, `pdf`, or `url`            |
| title       | string | Optional paper title               |
| text        | string | Required if inputType = text       |
| url         | string | Required if inputType = url        |
| pdf         | file   | Required if inputType = pdf        |

**Response 202:**
```json
{ "paperId": "uuid", "status": "pending" }
```

---

### GET /api/papers/:id
Poll for analysis result.

**Response:**
```json
{
  "id": "uuid",
  "status": "pending | processing | completed | failed",
  "result": { ... },
  "error_message": null
}
```

Poll every 2 seconds until `status === "completed"`.

---

### POST /api/papers/:id/retry
Retry a failed analysis.

---

### GET /api/papers
List last 20 papers (history).

---

## Frontend connection

1. Copy `frontend-api.js` to `src/services/api.js` in your React project.
2. Add to your frontend `.env`:
   ```
   VITE_API_URL=http://localhost:5000
   ```
3. Usage example:
```js
import { submitPaper, pollPaper } from './services/api';

// On form submit:
const { paperId } = await submitPaper({ inputType: 'text', text: abstractText });

// Poll for result:
const paper = await pollPaper(paperId, {
  onStatus: (status) => setProcessingStep(status),
});

// paper.result has all the AI data
setResult(paper.result);
```

## How async processing works

1. User submits paper → backend creates a DB record with `status: pending` and returns `paperId` immediately (202).
2. `setImmediate()` triggers `processAnalysis()` in the background (after HTTP response is sent).
3. Background function updates status to `processing`, calls Gemini, then sets `completed` or `failed`.
4. Frontend polls `GET /api/papers/:id` every 2 seconds and reads the status.

No Redis or queue needed — `setImmediate` is sufficient for a single-server deployment.
