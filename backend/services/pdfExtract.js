const fs = require('fs');
const { parsePdfBuffer } = require('./pdfText');

/**
 * Extracts plain text from a PDF file on disk.
 * @param {string} filePath - absolute path to the PDF
 * @returns {Promise<string>} extracted text
 */
async function extractTextFromPDF(filePath) {
  const dataBuffer = fs.readFileSync(filePath);
  return parsePdfBuffer(dataBuffer);
}

module.exports = { extractTextFromPDF };
