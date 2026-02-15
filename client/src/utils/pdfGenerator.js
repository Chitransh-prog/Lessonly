import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
import hljs from "highlight.js";

// Note: We do NOT import the CSS here because it won't apply to the iframe.
// We inject it manually below.

export async function generatePDFFromMarkdown(markdown, options = {}) {
  const {
    title = "Document",
    headerText = "LESSONLY",
    headerImageUrl = "/Logo.png", // Default to your local logo
    filename = "generated-document.pdf",
  } = options;

  // --- 1. Load Header Logo (Pre-fetch) ---
  const logoPromise = new Promise((resolve) => {
    if (!headerImageUrl) return resolve(null);
    const img = new Image();
    img.src = headerImageUrl;
    img.crossOrigin = "Anonymous"; // Critical for html2canvas
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.warn("Header image failed to load");
      resolve(null);
    };
  });

  const logoImage = await logoPromise;

  // --- 2. Setup HTML & Styles ---
  // We use a CDN for highlight.js styles so the iframe can access them
  const hljsStyleUrl = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css";

  const htmlContent = marked.parse(markdown || "");
  
  const iframeHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="stylesheet" href="${hljsStyleUrl}">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');
          
          html, body { 
            margin: 0; padding: 0; 
            background: #ffffff; 
            color: #111827; 
            font-family: 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
          }
          
          /* A4 Dimensions (approx) for the container to match PDF ratio */
          .pdf-container { 
            width: 794px; /* A4 width at 96 DPI */
            min-height: 1123px;
            padding: 40px 50px; 
            box-sizing: border-box;
          }

          /* Typography */
          h1.doc-title { 
            font-size: 32px; 
            font-weight: 800; 
            margin-bottom: 20px; 
            border-bottom: 3px solid #000; 
            padding-bottom: 10px;
          }
          h1 { font-size: 24px; margin-top: 24px; font-weight: 700; color: #111; }
          h2 { font-size: 20px; margin-top: 20px; font-weight: 600; color: #333; }
          p { font-size: 14px; line-height: 1.6; color: #374151; margin-bottom: 12px; }
          
          /* Code Blocks */
          pre { 
            background: #f3f4f6; 
            border: 1px solid #e5e7eb; 
            border-radius: 8px; 
            padding: 16px; 
            margin: 16px 0;
            white-space: pre-wrap; /* Prevents horizontal scroll cutting off code */
          }
          code { font-family: 'Courier New', monospace; font-size: 13px; color: #1f2937; }
          
          /* Tables */
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f9fafb; font-weight: 600; text-align: left; }
          th, td { border: 1px solid #d1d5db; padding: 10px; font-size: 13px; }

          /* Images */
          img { max-width: 100%; height: auto; border-radius: 4px; }
          
          /* Blockquotes */
          blockquote {
            border-left: 4px solid #3b82f6;
            background: #eff6ff;
            margin: 16px 0;
            padding: 12px 20px;
            color: #1e40af;
          }
        </style>
      </head>
      <body>
        <div class="pdf-container" id="pdf-content">
          <h1 class="doc-title">${title}</h1>
          ${htmlContent}
        </div>
      </body>
    </html>
  `;

  // --- 3. Create Invisible Iframe ---
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.left = "-10000px";
  iframe.style.top = "0";
  iframe.style.width = "850px"; // Slightly larger than container
  iframe.style.height = "2000px";
  document.body.appendChild(iframe);

  const idoc = iframe.contentDocument;
  idoc.open();
  idoc.write(iframeHTML);
  idoc.close();

  // --- 4. Wait for Assets to Load ---
  await new Promise((resolve) => {
    // Wait for the iframe itself to load (CSS, etc)
    iframe.onload = async () => {
      // Also wait for any images inside the markdown content
      const images = Array.from(idoc.images);
      await Promise.all(
        images.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((res) => { 
            img.onload = res; 
            img.onerror = res; 
          });
        })
      );
      // Small buffer for font rendering
      setTimeout(resolve, 500);
    };
  });

  // Apply Syntax Highlighting inside iframe
  idoc.querySelectorAll("pre code").forEach((block) => {
    hljs.highlightElement(block);
  });

  // --- 5. Capture Canvas ---
  const element = idoc.getElementById("pdf-content");
  const scale = 2; // Higher scale for sharper text
  
  const canvas = await html2canvas(element, {
    scale: scale,
    useCORS: true, // Crucial for external images
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: 850,
  });

  // --- 6. Generate PDF (Image Slicing Method) ---
  const pdf = new jsPDF("p", "pt", "a4");
  const pdfW = pdf.internal.pageSize.getWidth();  // 595.28 pt
  const pdfH = pdf.internal.pageSize.getHeight(); // 841.89 pt
  
  const margin = 30;
  const contentWidth = pdfW - (margin * 2);
  const contentHeight = pdfH - (margin * 2);

  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  
  // Calculate ratio to fit canvas width into PDF content width
  const ratio = contentWidth / imgWidth;
  
  // Convert PDF page height to canvas pixels
  const pageHeightInCanvasPixels = contentHeight / ratio;

  let heightLeft = imgHeight;
  let position = 0;
  let pageCount = 0;

  while (heightLeft > 0) {
    if (pageCount > 0) {
      pdf.addPage();
    }

    // --- Draw Header on every page ---
    // Background for header to cover any slice seams
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, pdfW, margin + 20, 'F');
    
    // Logo
    if (logoImage) {
      // Keep aspect ratio
      const logoW = 25;
      const logoH = (logoImage.height / logoImage.width) * logoW;
      pdf.addImage(logoImage, "PNG", margin, 15, logoW, logoH);
    }
    
    // Header Text
    pdf.setFontSize(9);
    pdf.setTextColor(150);
    pdf.text(headerText, pdfW - margin, 30, { align: "right" });
    
    // --- Draw Content Slice ---
    // Add Image slice
    // We add a slight vertical offset (margin + 20) to push content below header
    const topOffset = margin + 20;
    
    // Create a temporary canvas to slice the exact piece we need
    // This prevents "stretching" or "squashing" artifacts in jsPDF
    const sourceY = position;
    const sourceH = Math.min(heightLeft, pageHeightInCanvasPixels);
    
    const sliceCanvas = document.createElement('canvas');
    sliceCanvas.width = imgWidth;
    sliceCanvas.height = sourceH;
    
    const ctx = sliceCanvas.getContext('2d');
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0,0, sliceCanvas.width, sliceCanvas.height);
    
    // Draw the specific slice from original canvas
    ctx.drawImage(
      canvas, 
      0, sourceY, imgWidth, sourceH, // Source
      0, 0, imgWidth, sourceH        // Destination
    );

    const sliceData = sliceCanvas.toDataURL("image/jpeg", 0.95);
    
    // Calculate height in PDF points
    const pdfSliceHeight = sourceH * ratio;

    pdf.addImage(sliceData, "JPEG", margin, topOffset, contentWidth, pdfSliceHeight);

    heightLeft -= pageHeightInCanvasPixels;
    position += pageHeightInCanvasPixels;
    pageCount++;
  }

  // --- 7. Save & Cleanup ---
  pdf.save(filename);
  document.body.removeChild(iframe);
}