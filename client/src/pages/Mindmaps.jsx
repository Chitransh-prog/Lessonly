import { useState, useRef } from "react";
import TextType from "../animations/TextType";
import { fetchApiResponse_Mindmap } from "../api/Gemini";
import { saveMindmapToDB } from "../api/mindmap";
import { supabase } from "../lib/supabase";
import ExportButton from "../components/ExportButton";

// PDF Imports
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import { ReactFlowProvider } from "@xyflow/react";

import useThumbnail from "@/utils/useThumbnail";
import Flow from "../components/Flow.tsx";

// Initialize PDF Worker
GlobalWorkerOptions.workerSrc = workerSrc;

/* --------------------------------------
   CHILD COMPONENT (inside Provider)
-------------------------------------- */
function InnerFlowRenderer({
  nodes,
  edges,
  reactFlowWrapper,
  mindmapName,
  pdfText,
  fullAiResponse,
  userId,
}) {
  // Using your specific hook that handles Gen + Upload
  const { generateThumbnail } = useThumbnail();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToLibrary = async () => {
    if (!userId) {
      alert("You must be logged in to save.");
      return;
    }
    if (!mindmapName) {
      alert("Please provide a name for the mindmap.");
      return;
    }

    try {
      setIsSaving(true);

      console.log("1. Starting Thumbnail Process...");

      // Your hook already generates the PNG AND uploads it to Supabase 'Lessonly' bucket
      // It returns the Public URL string.
      const publicUrl = await generateThumbnail();

      if (!publicUrl) {
        throw new Error(
          "Thumbnail generation or upload failed (returned null)."
        );
      }

      console.log("2. Thumbnail uploaded to:", publicUrl);

      console.log("3. Saving Data to Database...");

      // We save the data.
      // Note: You mentioned you don't want the URL in the 'mindmaps' table,
      // so we only pass the data fields.
      await saveMindmapToDB({
        name: mindmapName,
        mindmap_json: fullAiResponse,
        source_text: pdfText,
        user_id: userId,
      });

      alert("Mindmap saved successfully!");
    } catch (error) {
      console.error("❌ Error saving mindmap:", error);
      alert(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div
        ref={reactFlowWrapper}
        className="h-[70vh] w-[90vw] mt-4 border rounded-lg shadow-lg bg-white relative"
      >
        <Flow nodes={nodes} edges={edges} />
      </div>

      <div className="flex gap-4 mt-4 mb-10">
        <ExportButton wrapperRef={reactFlowWrapper} />

        <button
          onClick={handleSaveToLibrary}
          disabled={isSaving}
          className={`px-6 py-3 rounded-lg text-white font-semibold transition-colors 
            ${isSaving ? "bg-green-700 cursor-wait" : "bg-green-600 hover:bg-green-500"}`}
        >
          {isSaving ? "Saving & Uploading..." : "Save Mindmap to Library"}
        </button>
      </div>
    </>
  );
}

/* --------------------------------------
   MAIN PAGE COMPONENT
-------------------------------------- */
export default function Mindmaps() {
  const [pdfFile, setPdfFile] = useState(null);
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);
  const [fullAiResponse, setFullAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState("");
  const [mindmapName, setMindmapName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const reactFlowWrapper = useRef(null);

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
      alert("Error reading PDF. Is it a valid text PDF?");
      return null;
    }
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("PDF Selected:", file.name);
      setPdfFile(file);
      setNodes(null);
      setEdges(null);
      setFullAiResponse(null);
      setPdfText("");
    }
  };

  const handleGenerate = async () => {
    if (!pdfFile) return alert("Upload a PDF first");
    if (!mindmapName.trim()) return alert("Please give this mindmap a name");

    try {
      setLoading(true);
      console.log("--- Generation Started ---");

      const uid = await getUserId();
      setCurrentUserId(uid);

      // 1. Extract Text
      const extractedText = await extractText(pdfFile);

      if (!extractedText || extractedText.length < 10) {
        throw new Error(
          "Could not extract text from PDF. It might be an image-scan."
        );
      }

      console.log(`Text Extracted: ${extractedText.length} characters`);
      setPdfText(extractedText);

      // 2. Call AI API
      console.log("Calling Gemini API...");
      const aiResponse = await fetchApiResponse_Mindmap(extractedText);

      console.log("AI Response received:", aiResponse);

      if (!aiResponse || !aiResponse.nodes || !aiResponse.edges) {
        throw new Error("AI returned invalid data structure.");
      }

      setFullAiResponse(aiResponse);
      setNodes(aiResponse.nodes);
      setEdges(aiResponse.edges);
    } catch (error) {
      console.error("❌ Generation Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 gap-6 pb-20">
      <img src="Logo.png" alt="Lessonly Logo" className="h-24" />

      <TextType
        className="text-4xl font-black"
        text={["Upload PDF → Generate Mindmap → Save to History"]}
        typingSpeed={200}
        pauseDuration={1500}
        showCursor={true}
        cursorCharacter="|"
      />

      <input
        type="text"
        placeholder="Enter a name for your mindmap"
        value={mindmapName}
        onChange={(e) => setMindmapName(e.target.value)}
        className="border h-12 w-96 rounded-sm border-gray-300 px-4 opacity-70"
      />

      <input
        type="file"
        accept="application/pdf"
        onChange={handlePdfUpload}
        className="border h-12 w-96 rounded-sm border-gray-300 px-4 opacity-70 cursor-pointer"
      />

      <div className="flex flex-row justify-around items-end w-[35vw]">
        <button
          onClick={handleGenerate}
          disabled={!pdfFile || loading}
          className={`mt-3 px-6 py-3 rounded-lg text-white font-semibold 
            ${!pdfFile ? "bg-gray-500 cursor-not-allowed" : "bg-black hover:bg-gray-900"}`}
        >
          {loading ? "Processing..." : "Generate Mindmap"}
        </button>
      </div>

      {nodes && edges && (
        <ReactFlowProvider>
          <InnerFlowRenderer
            nodes={nodes}
            edges={edges}
            reactFlowWrapper={reactFlowWrapper}
            mindmapName={mindmapName}
            pdfText={pdfText}
            fullAiResponse={fullAiResponse}
            userId={currentUserId}
          />
        </ReactFlowProvider>
      )}
    </div>
  );
}
