import { useState } from "react";
import TextType from "../animations/TextType";
import { fetchApiResponse_Mindmap } from "../api/OpenRouter";
import { saveMindmapToDB } from "../api/mindmap";
import { supabase } from "../lib/supabase";

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
  const [pdfText, setPdfText] = useState("");
  const [mindmapName, setMindmapName] = useState("");

  // Auth user fetch
  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  };

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
      return fullText.trim();
    } catch (error) {
      console.error("❌ PDF extraction error:", error);
      return null;
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
      setNodes(null);
      setEdges(null);
      setPdfText("");
    }
  };

  const handleSubmit = async () => {
    if (!pdfFile) return alert("Upload a PDF first");
    if (!mindmapName.trim()) return alert("Please give this mindmap a name");

    try {
      setLoading(true);

      // Extract text
      const extractedText = await extractText(pdfFile);
      setPdfText(extractedText);

      // Generate mindmap structure via AI
      const aiResponse = await fetchApiResponse_Mindmap(extractedText);

      setNodes(aiResponse.nodes);
      setEdges(aiResponse.edges);

      // Get user ID
      const user_id = await getUserId();

      // Save to Supabase
      await saveMindmapToDB({
        name: mindmapName,
        mindmap_json: aiResponse,
        source_text: extractedText,
        user_id,
      });

      alert("Mindmap saved successfully!");

    } catch (error) {
      console.error("❌ Error:", error);
      alert("Something went wrong while generating or saving the mindmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-start pt-10 gap-6">

      <img src="Logo.png" alt="Lessonly Logo" className="h-24" />

      <TextType
        className="text-4xl font-black"
        text={["Upload PDF → Generate Mindmap → Save to History"]}
        typingSpeed={200}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="|"
      />

      {/* Mindmap Name */}
      <input
        type="text"
        placeholder="Enter a name for your mindmap"
        value={mindmapName}
        onChange={(e) => setMindmapName(e.target.value)}
        className="border h-12 w-96 rounded-sm border-gray-300 px-4 opacity-70"
      />

      {/* PDF Upload */}
      <input
        type="file"
        accept="application/pdf"
        onChange={handlePdfUpload}
        className="border h-12 w-96 rounded-sm border-gray-300 px-4 opacity-70 cursor-pointer"
      />

      {/* Generate */}
      <button
        onClick={handleSubmit}
        disabled={!pdfFile || loading}
        className={`mt-3 px-6 py-3 rounded-lg text-white font-semibold 
          ${!pdfFile ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-900"}
        `}
      >
        {loading ? "Processing..." : "Generate & Save Mindmap"}
      </button>

      {/* React Flow Output */}
      {nodes && edges && (
        <div className="h-[70vh] w-[90vw] mt-4 border rounded-lg shadow-lg bg-white">
          <Flow nodes={nodes} edges={edges} />
        </div>
      )}
    </div>
  );
}
