const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Extracts plain text from a PDF file on disk.
 * @param {string} filePath - absolute path to the PDF
 * @returns {Promise<string>} extracted text
 */
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text || '';
}

module.exports = { extractTextFromPDF };
