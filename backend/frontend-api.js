// src/services/api.js
// ─────────────────────────────────────────────────────────────────────────────
// All calls to the PaperLens backend go through this file.
// Set VITE_API_URL in your frontend .env:  VITE_API_URL=http://localhost:5000

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// ─── Submit paper ─────────────────────────────────────────────────────────────
// inputType: 'text' | 'pdf' | 'url'
export async function submitPaper({ inputType, title, text, url, file }) {
  const formData = new FormData();
  formData.append('inputType', inputType);
  if (title)  formData.append('title', title);
  if (text)   formData.append('text',  text);
  if (url)    formData.append('url',   url);
  if (file)   formData.append('pdf',   file);

  const res = await fetch(`${BASE_URL}/api/papers`, {
    method: 'POST',
    body: formData,   // Don't set Content-Type — browser sets it with boundary
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit paper');
  return data; // { paperId, status }
}

// ─── Get paper by ID ──────────────────────────────────────────────────────────
export async function getPaper(paperId) {
  const res  = await fetch(`${BASE_URL}/api/papers/${paperId}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch paper');
  return data;
}

// ─── Poll until completed / failed ───────────────────────────────────────────
// Calls onStatus(status) on every poll so you can update your UI steps.
export async function pollPaper(paperId, { onStatus, intervalMs = 2000 } = {}) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const paper = await getPaper(paperId);
        onStatus?.(paper.status);

        if (paper.status === 'completed') {
          clearInterval(interval);
          resolve(paper);
        } else if (paper.status === 'failed') {
          clearInterval(interval);
          reject(new Error(paper.error_message || 'Analysis failed'));
        }
      } catch (err) {
        clearInterval(interval);
        reject(err);
      }
    }, intervalMs);
  });
}

// ─── Retry failed analysis ────────────────────────────────────────────────────
export async function retryPaper(paperId) {
  const res  = await fetch(`${BASE_URL}/api/papers/${paperId}/retry`, { method: 'POST' });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Retry failed');
  return data;
}

// ─── Get all papers (history) ─────────────────────────────────────────────────
export async function getAllPapers() {
  const res  = await fetch(`${BASE_URL}/api/papers`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch papers');
  return data;
}
