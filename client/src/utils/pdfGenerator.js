import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

/**
 * generatePDFFromMarkdown
 * @param {string} markdown - markdown content
 * @param {object} options
 * - title: document title (string)
 * - watermarkText: text watermark (string) - for central, rotated mark
 * - headerText: text for the fixed header (e.g., 'LESSONLY')
 * - headerImageUrl: image URL for the fixed header (e.g., '/Logo.png')
 * - filename: output filename
 */
export async function generatePDFFromMarkdown(markdown, options = {}) {
  const {
    title = "Document",
    watermarkText = "LESSONLY",
    headerText = "LESSONLY", // New parameter for fixed header text
    headerImageUrl = null, // New parameter for fixed header image
    filename = "generated-document.pdf",
  } = options;

  // --- Preload Header Image (If provided) ---
  let logoImage = null;
  let logoYOffset = 0; // To track where the logo stopped drawing

  if (headerImageUrl) {
    logoImage = new Image();
    logoImage.src = headerImageUrl;
    try {
      await new Promise((resolve, reject) => {
        logoImage.onload = resolve;
        logoImage.onerror = reject;
        // Fallback for immediate loading
        if (logoImage.complete) resolve();
      });
    } catch (e) {
      console.error("Could not load header image:", e);
      logoImage = null;
    }
  }

  // 1) Build a clean HTML snapshot (print-safe, no Tailwind)
  const html = marked.parse(markdown || "");
  const documentHtml = `
    <html>
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width,initial-scale=1"/>
        <style>
          /* Base print-safe styles (no CSS variables like oklch) */
          html,body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #111827;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .pdf-container {
            box-sizing: border-box;
            width: 794px; /* A4 px @ 96dpi ≈ 794 x 1123; we'll scale in canvas */
            /* Increase top padding to account for the fixed header */
            padding: 70px 48px 48px 48px; 
          }
          h1 { font-size: 26px; margin: 0 0 12px 0; }
          h2 { font-size: 20px; margin: 14px 0; }
          h3 { font-size: 16px; margin: 12px 0; }
          p { margin: 8px 0; line-height: 1.5; font-size: 13px; }
          ul, ol { margin: 8px 0 8px 20px; }
          pre {
            background: #0b0f1a; color: #e6eef8;
            padding: 12px; border-radius: 8px; overflow-x: auto; margin: 10px 0;
          }
          code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Courier New", monospace;
            font-size: 12px;
          }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 13px; }
          blockquote { border-left: 4px solid #e5e7eb; padding-left: 12px; color:#374151; margin: 8px 0; }
          /* ensure images fit */
          img { max-width: 100%; height: auto; display:block; margin: 8px 0; }

          /* Highlight.js theme fallback adjustments (we imported github.css in JS bundle) */
          pre code.hljs { background: transparent; padding: 0; }
        </style>
      </head>
      <body>
        <div class="pdf-container" id="pdf-content">
          <h1>${escapeHtml(title)}</h1>
          ${html}
        </div>

        </body>
    </html>
  `;

  // 2) Create an off-DOM iframe (isolates styles and prevents Tailwind leakage)
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-9999px";
  iframe.style.top = "-9999px";
  iframe.style.width = "820px";
  iframe.style.height = "1200px";
  iframe.style.border = "none";
  document.body.appendChild(iframe);

  // Write HTML to iframe document
  const idoc = iframe.contentDocument || iframe.contentWindow.document;
  idoc.open();
  idoc.write(documentHtml);
  idoc.close();

  // Wait for iframe content to be ready (images/fonts)
  await waitForImagesAndFonts(idoc);

  // Apply highlight.js to code blocks inside iframe
  const codeBlocks = idoc.querySelectorAll("pre code");
  codeBlocks.forEach((block) => {
    // Add hljs class for potential language autodetect
    try {
      hljs.highlightElement(block);
    } catch (e) {
      // fallback: do nothing
    }
  });

  // 3) Use html2canvas on the iframe's content container
  const contentEl = idoc.getElementById("pdf-content");
  if (!contentEl) {
    cleanupIframe(iframe);
    throw new Error("PDF content element not found");
  }

  // compute scale to produce high-quality images
  const scale = 2; // increase for sharper output (cost more memory)
  const canvas = await html2canvas(contentEl, {
    backgroundColor: "#ffffff",
    scale,
    windowWidth: contentEl.scrollWidth,
    windowHeight: contentEl.scrollHeight,
    useCORS: true,
    allowTaint: true,
  });

  // 4) Paginate canvas into A4 pages for jsPDF
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidthPt = pdf.internal.pageSize.getWidth(); // 595.28 pt for A4 in 'pt'
  const pageHeightPt = pdf.internal.pageSize.getHeight(); // 841.89 pt

  // convert canvas px -> pts: pts = px * 72 / 96 (assuming 96dpi)
  const pxToPt = (px) => (px * 72) / 96;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // target width in pts we want to fit into page width minus margins
  const marginPt = 40;
  // Increase top margin slightly to avoid header overlap
  const topMarginPt = 65;
  const printableWidthPt = pageWidthPt - marginPt * 2;
  const printableHeightPt = pageHeightPt - topMarginPt - marginPt;

  // compute scale factor to fit canvas width to printableWidthPt
  const canvasWidthPt = pxToPt(canvasWidth);
  const scaleFactor = printableWidthPt / canvasWidthPt;
  const renderedHeightPt = pxToPt(canvasHeight) * scaleFactor;

  // We'll cut by page height in pts
  const totalPages = Math.ceil(renderedHeightPt / printableHeightPt);

  // --- Helper Functions for Drawing ---

  // Draw Central Watermark (translucent, rotated)
  function drawCentralWatermark() {
    const watermarkAngle = 45;
    const watermarkOpacity = 0.12; // Use subtle opacity

    pdf.saveGraphicsState && pdf.saveGraphicsState();

    pdf.setAlpha && pdf.setAlpha(watermarkOpacity);
    pdf.setFontSize(60);
    pdf.setTextColor(150, 150, 150);

    const xCenter = pageWidthPt / 2;
    const yCenter = pageHeightPt / 2;

    pdf.text(watermarkText, xCenter, yCenter, {
      angle: watermarkAngle,
      align: "center",
    });

    pdf.restoreGraphicsState && pdf.restoreGraphicsState();
  }

  // Draw Fixed Header (logo and text)
  function drawFixedHeader() {
    const yLogo = 10;
    let currentY = yLogo;

    // 1. Draw Logo (if available)
    if (logoImage) {
      const logoW = 40;
      const logoH = (logoImage.height / logoImage.width) * logoW;
      const xLogo = (pageWidthPt - logoW) / 2;

      pdf.addImage(logoImage, "PNG", xLogo, currentY, logoW, logoH);
      currentY += logoH;
    }

    // 2. Draw Brand Text below logo or at the top (ALWAYS runs)
    if (headerText) {
      pdf.setFontSize(7);
      pdf.setTextColor(80, 80, 80);
      pdf.text(headerText, pageWidthPt / 2, currentY + 8, {
        align: "center",
      });
    }
  }

  // helper to get canvas chunk as image for a page
  for (let page = 0; page < totalPages; page++) {
    // Create a temporary canvas for this page slice
    const pageCanvas = document.createElement("canvas");
    const pageCanvasCtx = pageCanvas.getContext("2d");

    // compute source rectangle in original canvas px
    const pageHeightPx = (printableHeightPt * (96 / 72)) / scaleFactor;
    pageCanvas.width = canvas.width;
    pageCanvas.height = Math.min(
      pageHeightPx,
      canvas.height - page * pageHeightPx
    );

    pageCanvasCtx.fillStyle = "#ffffff";
    pageCanvasCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

    // draw slice
    pageCanvasCtx.drawImage(
      canvas,
      0,
      page * pageHeightPx,
      canvas.width,
      pageCanvas.height,
      0,
      0,
      canvas.width,
      pageCanvas.height
    );

    // convert the pageCanvas to image and add to PDF
    const imgData = pageCanvas.toDataURL("image/png");

    // Add page (first page uses existing page, subsequent pages add)
    if (page > 0) pdf.addPage();

    // 1. Draw Central Watermark (behind content)
    drawCentralWatermark();

    // 2. Add page content image
    // calculate image dimensions in points to fit printable width
    const imgWidthPt = printableWidthPt;
    const imgHeightPt = pxToPt(pageCanvas.height) * scaleFactor;
    const x = marginPt;
    const y = topMarginPt; // Start content lower to reserve space for header

    pdf.addImage(
      imgData,
      "PNG",
      x,
      y,
      imgWidthPt,
      imgHeightPt,
      undefined,
      "FAST"
    );

    // 3. Draw Fixed Header (on top of content)
    drawFixedHeader();
  }

  // cleanup
  cleanupIframe(iframe);

  // Save the PDF
  pdf.save(filename);

  // Utility helpers (omitted for brevity, assume they are still there)
  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cleanupIframe(ifr) {
    try {
      ifr.remove();
    } catch (e) {
      // ignore
    }
  }

  function waitForImagesAndFonts(doc) {
    return new Promise((resolve) => {
      const imgs = Array.from(doc.images || []);
      let loaded = 0;
      if (imgs.length === 0) {
        // still wait a small tick so CSS applies
        setTimeout(resolve, 80);
        return;
      }
      imgs.forEach((img) => {
        if (img.complete) {
          loaded++;
          if (loaded === imgs.length) resolve();
        } else {
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded === imgs.length) resolve();
          };
        }
      });
      // fallback timeout
      setTimeout(resolve, 1000);
    });
  }
}
