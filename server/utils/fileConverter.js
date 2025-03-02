import libreConvert from 'libreoffice-convert';
import fs from 'fs-extra';
import sharp from 'sharp';
import { promisify } from 'util';
import path from 'path';
import PDFDocument from 'pdfkit';

const convert = promisify(libreConvert.convert);

export const fileConverter = async (inputPath, outputPath, format) => {
  const ext = format.toLowerCase();
  const imageFormats = ['jpg', 'jpeg', 'png', 'webp'];

  try {
    if (ext === 'pdf') {
      // Determine input file extension (without dot)
      const inputExt = path.extname(inputPath).slice(1).toLowerCase();
      if (imageFormats.includes(inputExt)) {
        // Use PDFKit to create a PDF with the image
        const doc = new PDFDocument();
        const stream = fs.createWriteStream(outputPath);
        doc.pipe(stream);
        
        // Add image to the PDF (adjust fit dimensions as needed)
        doc.image(inputPath, {
          fit: [500, 700],
          align: 'center',
          valign: 'center'
        });
        doc.end();

        // Wait until writing finishes
        await new Promise((resolve, reject) => {
          stream.on('finish', resolve);
          stream.on('error', reject);
        });
        return true;
      } else {
        // For non-image inputs, attempt conversion via LibreOffice
        const inputFile = await fs.readFile(inputPath);
        const outputFile = await convert(inputFile, '.pdf', undefined);
        await fs.writeFile(outputPath, outputFile);
        return true;
      }
    } else if (['docx', 'pptx', 'txt'].includes(ext)) {
      const inputFile = await fs.readFile(inputPath);
      const outputFile = await convert(inputFile, `.${ext}`, undefined);
      await fs.writeFile(outputPath, outputFile);
      return true;
    } else if (imageFormats.includes(ext)) {
      await sharp(inputPath).toFormat(ext).toFile(outputPath);
      return true;
    }
  } catch (error) {
    console.error("Conversion error:", error);
  }
  return false;
};
