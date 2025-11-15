import { useState } from "react";
import TextType from "../animations/TextType";

import { generateMindmapGemini } from "../api/geminiMIndmap";
import { saveMindmapToDB } from "../api/mindmap";
import { supabase } from "../lib/supabase";
import ExportButton from "../components/ExportButton";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist/build/pdf";
import workerSrc from "pdfjs-dist/build/pdf.worker.mjs?url";

import Flow from "../components/Flow.tsx";

GlobalWorkerOptions.workerSrc = workerSrc;

export default function Mindmaps() {
  const [pdfFile, setPdfFile] = useState(null);
  const [nodes, setNodes] = useState(null);
  const [edges, setEdges] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mindmapName, setMindmapName] = useState("");

  // Fetch user ID
  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
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

            {/* Mindmap Flow */}
            {nodes && edges && (
              <div className="w-full h-[60vh] mt-6 border rounded-lg shadow-lg bg-white">
                <Flow nodes={nodes} edges={edges} />
              </div>
            )}
          </div>

          {/* History Button */}
          <button className="h-10 w-32 bg-[#101828] text-white text-lg rounded-lg absolute top-0 right-0">
            History
          </button>
        </div>
      </section>
    </>
  );
}
