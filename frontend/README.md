# PaperLens AI Frontend

This is the React + TypeScript frontend for PaperLens AI. It provides the product flow for adding a paper, watching analysis progress, and viewing a visual explanation page.

## What It Does

- Accepts paper input by PDF, URL, or pasted text
- Sends submissions to the backend API
- Shows a processing screen with progress polling
- Renders a visual result page with summary, concepts, math, preview, mind map, learning cards, and related topics

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Axios
- Custom CSS

## Setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start development server:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL. Example: `http://localhost:5000/api` |

All frontend API calls use `src/services/api.ts`, so changing `VITE_API_URL` updates the backend connection in one place. Restart Vite after changing `.env`.

## Important Files

```text
src/
├── App.tsx
├── main.tsx
├── pages/
│   ├── Home.tsx
│   ├── Processing.tsx
│   └── Explanation.tsx
├── components/
│   ├── SummaryCard.tsx
│   ├── KeyConcepts.tsx
│   ├── MathMadeSimple.tsx
│   ├── PaperPreview.tsx
│   ├── MindMap.tsx
│   ├── VisualLearningCards.tsx
│   └── RelatedTopics.tsx
├── services/
│   └── api.ts
└── styles/
    └── globals.css
```

## Scripts

```bash
npm run dev      # start Vite dev server
npm run build    # production build
npm run lint     # run ESLint
npm run preview  # preview production build
```

## Backend Contract

The frontend expects these endpoints:

```text
POST /api/papers/upload
GET  /api/papers/:id/status
GET  /api/papers/:id
POST /api/papers/:id/retry
```

## Notes

- External paper websites such as arXiv may block iframe previews, so the UI shows an open-source link card.
- `.env` contains local configuration and should not be committed with real secrets.
