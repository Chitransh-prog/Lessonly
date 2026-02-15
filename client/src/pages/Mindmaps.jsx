import { useState, useRef } from "react";
import TextType from "../animations/TextType";
import { saveMindmapToDB } from "../api/saveMindmap";
import { supabase } from "../lib/supabase";
import ExportButton from "../components/ExportButton";
import { ReactFlowProvider } from "@xyflow/react";
import useThumbnail from "@/utils/useThumbnail";
import Flow from "../components/Flow"; // Removed .tsx extension for standard import
import { useNavigate } from "react-router-dom";
import { extractPdfText } from "@/utils/extractPdfText";
import { generateMindmapFromPdf } from "../api/fetchNodesAndEdges"; // Removed .tsx extension

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
    <div className="w-full flex flex-col items-center animate-fadeIn">
      {/* GLASS FLOW CONTAINER */}
      <div
        ref={reactFlowWrapper}
        className="h-[75vh] w-full max-w-[95vw] mt-8 border border-white/10 rounded-3xl shadow-2xl bg-slate-900/50 backdrop-blur-sm overflow-hidden relative"
      >
        <Flow nodes={nodes} edges={edges} />
      </div>

      {/* ACTION BAR */}
      <div className="flex gap-4 mt-6 mb-12">
        <ExportButton wrapperRef={reactFlowWrapper} />

        <button
          onClick={handleSaveToLibrary}
          disabled={isSaving}
          className={`px-8 py-3 rounded-xl font-bold shadow-lg transition-all duration-300 ${
            isSaving
              ? "bg-green-900/50 text-green-200 cursor-wait border border-green-800"
              : "bg-green-600 text-white hover:bg-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:-translate-y-1"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            "Save to Library"
          )}
        </button>
      </div>
    </div>
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
  };

  const handleGenerate = async () => {
    if (!pdfFile) return alert("Upload a PDF first");
    if (!mindmapName.trim()) return alert("Name your mindmap");

    try {
      setLoading(true);
      const uid = await getUserId();
      setCurrentUserId(uid);

      const extractedText = await extractPdfText(pdfFile);

      const aiResponse = await generateMindmapFromPdf(extractedText);
      if (!aiResponse?.nodes || !aiResponse?.edges) {
        throw new Error("Invalid AI response");
      }

      setFullAiResponse(aiResponse);
      setNodes(aiResponse.nodes);
      setEdges(aiResponse.edges);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-x-hidden flex flex-col items-center pt-12 pb-20 px-4">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* History Button - Positioned Absolute Relative to Page, NOT Card */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={() => navigate("/mindmaps-history")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-slate-800 transition-all backdrop-blur-md shadow-lg"
        >
          <img src="history.svg" className="h-4 w-4 opacity-70" alt="History" />
          <span className="font-medium">History</span>
        </button>
      </div>

      {/* LOGO & TITLE */}
      <div className="relative z-10 flex flex-col items-center gap-4 mb-10">
        <img 
          src="Logo.png" 
          alt="Lessonly" 
          className="h-20 w-20 drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]" 
        />

        <div className="h-12 flex items-center">
            <TextType
            className="text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md text-center"
            text={["Upload PDF → Generate Mindmap"]}
            typingSpeed={80}
            pauseDuration={2000}
            showCursor
            cursorCharacter="|"
            />
        </div>
      </div>

      {/* CONTROL PANEL (Glass Card) */}
      <div className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col gap-6 animate-slide-down">
        
        {/* Name Input */}
        <div>
            <label className="block text-slate-400 text-sm font-semibold mb-2 ml-1">Mindmap Name</label>
            <input
            type="text"
            placeholder="e.g. Photosynthesis Process"
            value={mindmapName}
            onChange={(e) => setMindmapName(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
        </div>

        {/* Upload Area */}
        <label className={`group w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
            pdfFile 
            ? "border-cyan-500/50 bg-cyan-500/10" 
            : "border-slate-600 hover:border-cyan-400 hover:bg-slate-800/50"
        }`}>
            <div className="p-4 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors mb-3 shadow-lg">
                <img src="upload.svg" className="w-8 h-8 opacity-80" alt="Upload" />
            </div>
            
            <p className="text-slate-300 font-medium group-hover:text-cyan-400 transition-colors">
            {pdfFile ? (
                <span className="flex items-center gap-2">
                    <span className="text-cyan-400">📄</span> {pdfFile.name}
                </span>
            ) : (
                "Click to upload PDF"
            )}
            </p>
            <p className="text-slate-500 text-xs mt-1">Maximum size: 10MB</p>

            <input
            type="file"
            accept="application/pdf"
            onChange={handlePdfUpload}
            className="hidden"
            />
        </label>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!pdfFile || loading}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg ${
            loading || !pdfFile
              ? "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              : "bg-cyan-400 text-slate-900 hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:-translate-y-1"
          }`}
        >
          {loading ? (
             <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing PDF...
             </span>
          ) : (
            "✨ Generate Mindmap"
          )}
        </button>
      </div>

      {/* RENDERED MINDMAP AREA */}
      {nodes && edges && (
        <ReactFlowProvider>
          <div className="w-full max-w-7xl animate-fadeIn mt-8">
            <InnerFlowRenderer
                nodes={nodes}
                edges={edges}
                reactFlowWrapper={reactFlowWrapper}
                mindmapName={mindmapName}
                fileName={fileName}
                fullAiResponse={fullAiResponse}
                userId={currentUserId}
            />
          </div>
        </ReactFlowProvider>
      )}
    </div>
  );
}