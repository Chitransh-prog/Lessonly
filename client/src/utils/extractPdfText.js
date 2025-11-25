import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

// Load the worker file (needed for browsers)
GlobalWorkerOptions.workerSrc = workerSrc;
/**
 * Extract text from a PDF File in the browser.
 * @param {File} pdfFile
 * @returns {Promise<string>}
 */
export async function extractPdfText(pdfFile) {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });

    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      const strings = content.items.map((item) => item.str);
      fullText += strings.join(" ") + "\n";
    }

    return fullText.trim();
  } catch (err) {
    console.error("PDF extraction failed:", err);
    throw new Error("Failed to extract text from PDF");
  }
}
