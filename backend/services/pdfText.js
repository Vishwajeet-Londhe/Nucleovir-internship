const pdfParseModule = require('pdf-parse');

async function parsePdfBuffer(buffer) {
  if (typeof pdfParseModule === 'function') {
    const data = await pdfParseModule(buffer);
    return data.text || '';
  }

  if (pdfParseModule.PDFParse) {
    const parser = new pdfParseModule.PDFParse({ data: buffer });

    try {
      const result = await parser.getText();
      return result.text || '';
    } finally {
      await parser.destroy();
    }
  }

  throw new Error('Unsupported pdf-parse package export.');
}

module.exports = { parsePdfBuffer };
