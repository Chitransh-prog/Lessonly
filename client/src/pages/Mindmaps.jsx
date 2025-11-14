import { useState } from "react";
import { fetchApiResponse_Mindmap } from "../api/OpenRouter";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import Flow from "../components/Flow.tsx";

GlobalWorkerOptions.workerSrc = workerSrc;

export default function Mindmaps() {
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  const extractText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      return fullText;
    } catch (error) {
      console.error("PDF extraction error:", error);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
  };

  const handleSubmit = async () => {
    if (!pdfFile) {
      alert("Please upload a pdf first");
      return;
    }
    try {
      setLoading(true);

      const extractedText = await extractText(pdfFile);
      const { nodes, edges } = await fetchApiResponse_Mindmap(extractedText);
      setNodes(nodes);
      setEdges(edges);
      setLoading(false);
    } catch (error) {
      console.error(
        "Error while extracting text or while fetching ai response",
        error
      );
    }
  };

  return (
    <>
      <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
      <button onClick={handleSubmit} disabled={!pdfFile}>
        Generate Mindmap
      </button>

      {loading && <h2>Processing... Please wait.</h2>}

      {nodes && edges && (
        <pre>
          <Flow nodes={nodes} edges={edges} />
        </pre>
      )}
    </>
  );
}
