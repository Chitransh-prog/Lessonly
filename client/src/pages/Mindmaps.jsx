import { useState } from "react";
import TextType from "../animations/TextType";

import { generateMindmapGemini } from "../api/geminiMIndmap";
import { saveMindmapToDB } from "../api/mindmap";
import { supabase } from "../lib/supabase";

import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";
import { useNavigate } from "react-router-dom";
import Flow from "../components/Flow.tsx";

GlobalWorkerOptions.workerSrc = workerSrc;

export default function Mindmaps() {
  const [pdfFile, setPdfFile] = useState(null);
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mindmapName, setMindmapName] = useState("");
  const navigate = useNavigate();


  // Fetch user ID
  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  };
  const downloadMindmap = () => {
  if (!nodes || !edges) return alert("Generate a mindmap first");

  const data = {
    name: mindmapName || "mindmap",
    nodes,
    edges,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${mindmapName || "mindmap"}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

  // Extract text from PDF
  const extractText = async (file) => {
    try {
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

      let full = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        full += content.items.map((item) => item.str).join(" ") + "\n";
      }
      return full.trim();

    } catch (error) {
      console.error("PDF extraction error:", error);
      alert("Could not extract text from PDF");
      return null;
    }
  };

  const handlePdfUpload = (e) => {
    setPdfFile(e.target.files?.[0]);
    setNodes(null);
    setEdges(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) return alert("Upload a PDF first");
    if (!mindmapName.trim()) return alert("Please enter a mindmap name");

    try {
      setLoading(true);

      const extracted = await extractText(pdfFile);

      // AI MINDMAP via GEMINI
      const ai = await generateMindmapGemini(extracted);

      setNodes(ai.nodes);
      setEdges(ai.edges);

      // Save to Supabase
      const user_id = await getUserId();
      await saveMindmapToDB({
        name: mindmapName,
        mindmap_json: ai,
        source_text: extracted,
        user_id,
      });

      alert("Mindmap generated & saved successfully!");

    } catch (err) {
      console.error(err);
      alert("Error generating mindmap");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="min-h-screen w-full flex justify-center items-center">
        <div className="w-[70%] h-screen p-5 flex justify-center items-center relative">

          <div className="w-full h-[95vh] p-3">
            
            {/* Logo + Heading */}
            <div className="w-full h-36">
              <div className="flex justify-center items-center">
                <img src="Logo.png" alt="logo" className="h-20 w-20" />
              </div>
              <div className="flex justify-center items-center">
                <TextType
                  className="text-3xl font-black"
                  text={["Mindmaps Creator"]}
                  typingSpeed={200}
                  pauseDuration={1500}
                  showCursor={true}
                  cursorCharacter="|"
                />
              </div>
            </div>

            {/* Upload Form */}
            <div className="w-full flex justify-center items-center">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col items-center justify-center gap-6"
              >
                {/* Mindmap Name */}
                <input
                  type="text"
                  placeholder="Enter mindmap name"
                  value={mindmapName}
                  onChange={(e) => setMindmapName(e.target.value)}
                  className="border h-12 w-96 rounded-md border-gray-300 px-3 opacity-70"
                />

                {/* File Upload */}
                <label className="relative flex items-center justify-center w-[380px] h-[120px] border border-dashed border-gray-500 text-xl font-bold rounded-lg px-3 cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <img
                      src="/src/Images/upload.png"
                      alt="upload"
                      className="h-12 w-12 opacity-70"
                    />
                    <span className="text-black text-lg mt-2">
                      Choose the file to Upload
                    </span>
                  </div>

                  <input
                    type="file"
                    accept="application/pdf"
                    className=""
                    onChange={handlePdfUpload}
                  />
                </label>

                {/* Generate Button + AI Icon */}
                <button
                  type="submit"
                  className="border h-12 w-96 rounded-xl border-gray-300 bg-black text-white font-semibold flex justify-center items-center gap-2"
                >
                  {loading ? "Processing..." : "Generate with"}
                  <img src="AI.svg" className="h-7 ml-2" />
                </button>
              </form>
            </div>

            {/* Mindmap Flow */}
            {nodes && edges && (
            <>
              <div className="w-full h-[60vh] mt-6 border rounded-lg shadow-lg bg-white">
                <Flow nodes={nodes} edges={edges} />
              </div>

              {/* Download Button */}
              <div className="w-full flex justify-center absolute top-0 right-0">
                <button
                  onClick={downloadMindmap}
                  className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
                >
                  Download Mindmap
                </button>
              </div>
            </>
)}
          </div>

          {/* History Button */}
          <button onClick={()=> navigate("/mindmaps-history")} className="h-10 w-32 bg-[#101828] text-white text-lg rounded-lg absolute top-24 right-16 flex items-center justify-center gap-2">
            <img src="history.svg" className="h-4" />
            History
          </button>
        </div>
      </section>
    </>
  );
}
