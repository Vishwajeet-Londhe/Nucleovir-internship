const axios = require('axios');
const cheerio = require('cheerio');
const { parsePdfBuffer } = require('./pdfText');

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (compatible; PaperLensBot/1.0)',
};

/**
 * Fetch paper text from a URL.
 * Handles arXiv specially; falls back to generic scraping.
 */
async function fetchTextFromURL(url) {
  // ── arXiv ──────────────────────────────────────────────────────────────────
  if (url.includes('arxiv.org')) {
    return fetchArxiv(url);
  }

  // ── Direct PDF links ───────────────────────────────────────────────────────
  if (/\.pdf($|[?#])/i.test(url)) {
    return fetchPdfText(url);
  }

  // ── Generic web page ───────────────────────────────────────────────────────
  const response = await axios.get(url, {
    timeout: 15000,
    headers: HEADERS,
    responseType: 'arraybuffer',
  });

  const contentType = response.headers['content-type'] || '';
  if (contentType.includes('application/pdf')) {
    const text = await parsePdfBuffer(Buffer.from(response.data));
    return text.replace(/\s+/g, ' ').trim().slice(0, 20000);
  }

  const html = Buffer.from(response.data).toString('utf8');
  const $ = cheerio.load(html);

  // Remove noise
  $('script, style, nav, footer, header, .sidebar, .ads, .menu').remove();

  // Try to find the main content
  const content =
    $('main, article, .content, #content, .abstract, .paper-body').text() ||
    $('body').text();

  return content.replace(/\s+/g, ' ').trim().slice(0, 15000);
}

async function fetchPdfText(url) {
  const response = await axios.get(url, {
    timeout: 20000,
    headers: HEADERS,
    responseType: 'arraybuffer',
  });

  const text = await parsePdfBuffer(Buffer.from(response.data));
  return text.replace(/\s+/g, ' ').trim().slice(0, 20000);
}

async function fetchArxiv(url) {
  // Normalise to abstract page (works for both /abs/ and /pdf/ URLs)
  let absUrl = url
    .replace('/pdf/', '/abs/')
    .replace(/\.pdf$/, '');

  const response = await axios.get(absUrl, { timeout: 15000, headers: HEADERS });
  const $ = cheerio.load(response.data);

  const title    = $('h1.title, #abs .title').text().replace('Title:', '').trim();
  const authors  = $('#abs .authors').text().replace('Authors:', '').trim();
  const abstract = $('blockquote.abstract, #abs .abstract')
    .text()
    .replace('Abstract:', '')
    .trim();

  return `Title: ${title}\n\nAuthors: ${authors}\n\nAbstract:\n${abstract}`;
}

module.exports = { fetchTextFromURL };
