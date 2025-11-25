import { useState, useRef } from "react";
import TextType from "../animations/TextType";
import { saveMindmapToDB } from "../api/mindmap";
import { supabase } from "../lib/supabase";
import ExportButton from "../components/ExportButton";
import { ReactFlowProvider } from "@xyflow/react";

import useThumbnail from "@/utils/useThumbnail";
import Flow from "../components/Flow.tsx";
import { useNavigate } from "react-router-dom";

import { generateMindmapFromPdf } from "../api/fetchAiResponse";
import { extractPdfText } from "@/utils/extractPdfText";

function InnerFlowRenderer({
  nodes,
  edges,
  reactFlowWrapper,
  mindmapName,
  fileName,
  fullAiResponse,
  userId,
}) {
  const { generateThumbnail } = useThumbnail();
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToLibrary = async () => {
    if (!userId) return alert("You must be logged in.");
    if (!mindmapName.trim()) return alert("Give the mindmap a name.");

    try {
      setIsSaving(true);

      const privatePath = await generateThumbnail();
      if (!privatePath) throw new Error("Thumbnail upload failed");

      await saveMindmapToDB({
        name: mindmapName,
        mindmap_json: fullAiResponse,
        source_text: fileName,
        user_id: userId,
        thumbnail_path: privatePath,
      });

      alert("Mindmap saved!");
    } catch (error) {
      alert(error.message);
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
          className={`px-6 py-3 rounded-lg text-white font-semibold ${
            isSaving
              ? "bg-green-700 cursor-wait"
              : "bg-green-600 hover:bg-green-500"
          }`}
        >
          {isSaving ? "Saving..." : "Save Mindmap"}
        </button>
      </div>
    </>
  );
}

export default function Mindmaps() {
  const [pdfFile, setPdfFile] = useState(null);
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);
  const [fullAiResponse, setFullAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mindmapName, setMindmapName] = useState("");
  const [fileName, setFileName] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();
  const reactFlowWrapper = useRef(null);

  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  };

  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    setNodes(null);
    setEdges(null);
    setFullAiResponse(null);
    setFileName(file.name);

    console.log("PDF selected:", file.name);
  };

  const handleGenerate = async () => {
    if (!pdfFile) return alert("Upload a PDF first");
    if (!mindmapName.trim()) return alert("Name your mindmap");

    try {
      setLoading(true);
      console.log("Extracting text from PDF…");

      const uid = await getUserId();
      setCurrentUserId(uid);

      const extractedText = await extractPdfText(pdfFile);
      console.log("Extracted text length:", extractedText.length);

      const aiResponse = await generateMindmapFromPdf(extractedText);

      if (!aiResponse?.nodes || !aiResponse?.edges) {
        throw new Error("Invalid AI response");
      }

      setFullAiResponse(aiResponse);
      setNodes(aiResponse.nodes);
      setEdges(aiResponse.edges);

      console.log("Mindmap generated!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center pt-10 gap-6 pb-20">
      <img src="Logo.png" alt="Lessonly" className="h-24" />

      <TextType
        className="text-4xl font-black"
        text={["Upload PDF → Generate Mindmap → Save"]}
        typingSpeed={200}
        pauseDuration={1500}
        showCursor
        cursorCharacter="|"
      />

      <input
        type="text"
        placeholder="Name your mindmap"
        value={mindmapName}
        onChange={(e) => setMindmapName(e.target.value)}
        className="border h-12 w-96 rounded-sm border-gray-300 px-4 opacity-70"
      />
      <div class="w-128 h-36 border-2 border-dashed border-gray-400 p-4 flex items-center justify-center text-gray-700 transition duration-300 hover:bg-blue-100 hover:border-blue-700">
      <img src="upload.svg" className="w-10 h-10 flex flex-col items-center"/>
      <input
        type="file"
        accept="application/pdf"
        onChange={handlePdfUpload}
        className=""
        placeholder="Choose file to Upload"
      />
      </div>
      <div className="flex justify-around items-end w-[35vw]">
        <button
          onClick={handleGenerate}
          disabled={!pdfFile || loading}
          className={`mt-3 px-6 py-3 rounded-lg text-white font-semibold flex flex-row items-center ${
            loading || !pdfFile
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-black hover:bg-gray-900"
          }`}
        >
          {loading ? "Processing..." : "Generate Mindmap"}
        </button>

        <button
          onClick={() => navigate("/mindmaps-history")}
          className="h-10 w-32 bg-[#101828] text-white text-lg rounded-lg absolute top-24 right-60 flex items-center justify-center gap-2"
        >
          <img src="history.svg" className="h-4" />
          History
        </button>
        </div>

      {nodes && edges && (
        <ReactFlowProvider>
          <InnerFlowRenderer
            nodes={nodes}
            edges={edges}
            reactFlowWrapper={reactFlowWrapper}
            mindmapName={mindmapName}
            fileName={fileName}
            fullAiResponse={fullAiResponse}
            userId={currentUserId}
          />
        </ReactFlowProvider>
      )}
    </div>
  );
}