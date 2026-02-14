import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

export async function generatePDFFromMarkdown(markdown, options = {}) {
  const {
    title = "Document",
    headerText = "LESSONLY",
    headerImageUrl = null,
    filename = "generated-document.pdf",
  } = options;

  // --- Preload Header Image ---
  let logoImage = null;
  if (headerImageUrl) {
    logoImage = new Image();
    logoImage.src = headerImageUrl;
    try {
      await new Promise((resolve, reject) => {
        logoImage.onload = resolve;
        logoImage.onerror = reject;
        if (logoImage.complete) resolve();
      });
    } catch (e) {
      console.error("Header image load failed:", e);
    }
  }

  // 1) Build HTML snapshot
  const html = marked.parse(markdown || "");
  const documentHtml = `
    <html>
      <head>
        <style>
          html, body { margin: 0; padding: 0; background: #fff; color: #111827; font-family: sans-serif; }
          .pdf-container { box-sizing: border-box; width: 794px; padding: 70px 48px 48px 48px; }
          h1 { font-size: 26px; margin: 0 0 12px 0; border-bottom: 2px solid #eee; padding-bottom: 8px; }
          p { margin: 8px 0; line-height: 1.6; font-size: 13px; }
          pre { background: #1a1a1a; color: #fff; padding: 12px; border-radius: 6px; }
          code { font-family: monospace; font-size: 12px; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="pdf-container" id="pdf-content">
          <h1>${title}</h1>
          ${html}
        </div>
      </body>
    </html>
  `;

  // 2) Off-DOM Iframe for styling isolation
  const iframe = document.createElement("iframe");
  Object.assign(iframe.style, { position: "fixed", left: "-9000px", width: "820px" });
  document.body.appendChild(iframe);
  const idoc = iframe.contentDocument;
  idoc.open();
  idoc.write(documentHtml);
  idoc.close();

  await new Promise(resolve => setTimeout(resolve, 150)); // Allow styles to snap

  // Syntax Highlighting
  idoc.querySelectorAll("pre code").forEach(block => hljs.highlightElement(block));

  // 3) Capture Canvas
  const contentEl = idoc.getElementById("pdf-content");
  const scale = 1.5; // Optimized for speed/quality balance
  const canvas = await html2canvas(contentEl, {
    backgroundColor: "#ffffff",
    scale,
    useCORS: true,
    logging: false
  });

  // 4) Generate PDF
  const pdf = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 40;
  const topMargin = 65;
  const printW = pageWidth - margin * 2;
  const printH = pageHeight - topMargin - margin;

  const canvasW = canvas.width;
  const ratio = printW / (canvasW * (72 / 96) / scale);
  const totalHeightPt = (canvas.height * (72 / 96) / scale) * ratio;
  const totalPages = Math.ceil(totalHeightPt / printH);

  for (let i = 0; i < totalPages; i++) {
    if (i > 0) pdf.addPage();

    // Draw Header
    if (logoImage) {
      pdf.addImage(logoImage, "PNG", (pageWidth - 30) / 2, 10, 30, 30);
    }
    pdf.setFontSize(8);
    pdf.setTextColor(100);
    pdf.text(headerText, pageWidth / 2, 48, { align: "center" });

    // Chunk Canvas
    const pageCanvas = document.createElement("canvas");
    const ctx = pageCanvas.getContext("2d");
    const sliceHpx = (printH / ratio) / (72 / 96) * scale;
    
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.min(sliceHpx, canvas.height - i * sliceHpx);
    
    ctx.drawImage(canvas, 0, i * sliceHpx, canvas.width, pageCanvas.height, 0, 0, canvas.width, pageCanvas.height);
    
    const imgData = pageCanvas.toDataURL("image/jpeg", 0.85); // JPEG is faster/smaller than PNG
    pdf.addImage(imgData, "JPEG", margin, topMargin, printW, (pageCanvas.height * (72 / 96) / scale) * ratio);
    
    // Cleanup chunk memory
    pageCanvas.width = 0; 
    pageCanvas.height = 0;
  }

  cleanupIframe(iframe);
  pdf.save(filename);
}

function cleanupIframe(ifr) {
  try { ifr.parentElement.removeChild(ifr); } catch (e) {}
}