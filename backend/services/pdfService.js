const { PDFParse } = require('pdf-parse');

exports.extractText = async (dataBuffer) => {
    if (!dataBuffer || dataBuffer.length === 0) {
        throw new Error('No PDF file data provided.');
    }

    try {
        // Convert Buffer to Uint8Array as required by pdf-parse ^2.4.5
        const uint8Array = new Uint8Array(dataBuffer);
        const parser = new PDFParse(uint8Array);
        const result = await parser.getText();
        const extractedText = (result?.text || '').trim();

        if (extractedText.length < 20) {
            throw new Error('The uploaded PDF appears to be empty or contains only scanned images. Please provide a PDF with selectable text.');
        }

        return extractedText;
    } catch (error) {
        if (error.message.includes('scanned images') || error.message.includes('No PDF file')) {
            throw error;
        }
        console.error('Error parsing PDF:', error.message);
        throw new Error('Unable to read this PDF file. The document may be corrupted, scanned, or password-protected.');
    }
};
