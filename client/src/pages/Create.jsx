import { useState, useEffect, useMemo } from "react";
import TextType from "../animations/TextType";
import { generateEducationalContent } from "../api/gemini";
import { saveGeneratedContent } from "../api/content";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import { marked } from "marked";
import "highlight.js/styles/github-dark.css"; // Changed to dark theme for code blocks
import { generatePDFFromMarkdown } from "@/utils/pdfGenerator";

// Clean Markdown logic
function sanitizeToMarkdown(input) {
  if (!input) return "";
  let text = typeof input === "string" ? input : 
             input?.response || input?.content || input?.markdown || input?.text || 
             JSON.stringify(input, null, 2);

  return text.replace(/<[^>]*>/g, "").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n{3,}/g, "\n\n").trim();
}

export default function Create() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [result, setResult] = useState("");
  
  // 1. Consolidated Form State
  const [formData, setFormData] = useState({
    topic: "", summary: "", type: "", grade: "", tone: "", language: "", syllabus: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Helper to get User ID
  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  };

  // 2. Memoized Markdown Parsing
  const renderedHTML = useMemo(() => {
    return result ? marked.parse(result) : "";
  }, [result]);

  // 3. Highlight.js effect
  useEffect(() => {
    if (!isEditing && result) {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }, [result, isEditing]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(""); 

    const { topic, summary, type, grade, tone, language, syllabus } = formData;

    try {
      const data = await generateEducationalContent({
        topic, summary, type, grade, tone, language, syllabus,
      });

      if (!data) throw new Error("No data received from AI");

      const cleaned = sanitizeToMarkdown(data);
      setResult(cleaned);

      try {
        const user_id = await getUserId();
        if (user_id) {
          await saveGeneratedContent({
            title: topic,
            description: summary || "",
            syllabus: syllabus || "",
            content: cleaned,
            user_id,
          });
          console.log("✅ Auto-saved to history");
        }
      } catch (saveError) {
        console.warn("⚠️ Could not auto-save to history", saveError);
      }

    } catch (err) {
      console.error("❌ Generation Error:", err);
      setResult("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (content, title) => {
    if (!content) return;
    generatePDFFromMarkdown(content, {
      title,
      filename: `${title}.pdf`,
      watermarkText: "LESSONLY",
      headerText: "LESSONLY",
      headerImageUrl: "/Logo.png",
    });
  };

  // Common Input Styles for reuse
  const inputClasses = "w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all";

  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 px-6 overflow-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl flex flex-col gap-8 relative z-10">
        
        {/* History Button (Top Right) */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => navigate("/create-history")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 hover:bg-slate-800 transition-all backdrop-blur-md shadow-lg"
        >
          <img src="history.svg" className="h-4 w-4 opacity-70" alt="History" />
          <span className="font-medium">History</span>
        </button>
      </div>

        {/* INPUT CARD */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <img 
              src="Logo.png" 
              alt="logo" 
              className="h-16 w-16 mb-4 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]" 
            />
            <div className="h-10">
              <TextType 
                className="text-3xl font-bold text-white tracking-tight" 
                text={["Content Generation"]} 
                typingSpeed={100} 
                pauseDuration={1500} 
              />
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <input 
                name="topic" 
                value={formData.topic} 
                onChange={handleInputChange} 
                className={inputClasses} 
                placeholder="What do you want to teach? (Topic)" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               <textarea 
                 name="syllabus" 
                 value={formData.syllabus} 
                 onChange={handleInputChange} 
                 className={`${inputClasses} h-24 resize-none`} 
                 placeholder="Paste Syllabus or Requirements (Optional)" 
               />
               <textarea 
                 name="summary" 
                 value={formData.summary} 
                 onChange={handleInputChange} 
                 className={`${inputClasses} h-24 resize-none`} 
                 placeholder="Specific focus or Summary (Optional)" 
               />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange} 
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                      <option value="" className="bg-slate-800">Select Content Type</option>
                      <option value="Lesson Plan" className="bg-slate-800">Lesson Plan</option>
                      <option value="Quiz" className="bg-slate-800">Quiz</option>
                      <option value="Study Notes" className="bg-slate-800">Study Notes</option>
                  </select>
                  {/* Custom Arrow */}
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    name="grade" 
                    value={formData.grade} 
                    onChange={handleInputChange} 
                    className={`${inputClasses} appearance-none cursor-pointer`}
                  >
                      <option value="" className="bg-slate-800">Select Grade Level</option>
                      <option value="High School" className="bg-slate-800">High School</option>
                      <option value="College/University" className="bg-slate-800">College/University</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                  </div>
                </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-4 mt-2 rounded-xl bg-cyan-400 text-slate-900 font-bold text-lg shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] hover:bg-cyan-300 hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </span>
              ) : "✨Generate with AI"}
            </button>
          </form>
        </div>

        {/* RESULTS CARD */}
        {result && (
          <div className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
              <h3 className="text-xl font-semibold text-cyan-400">Generated Content</h3>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsEditing(!isEditing)} 
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {isEditing ? "Preview" : "Edit Markdown"}
                </button>
                <button 
                  onClick={() => handleDownloadPDF(result, formData.topic || "Document")} 
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20 transition-all"
                >
                  Download PDF
                </button>
              </div>
            </div>

            {isEditing ? (
              <textarea 
                className="w-full h-[500px] bg-slate-950 border border-slate-700 rounded-xl p-4 font-mono text-sm text-slate-300 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 outline-none resize-none" 
                value={result} 
                onChange={(e) => setResult(e.target.value)} 
              />
            ) : (
              <div className="prose prose-invert prose-lg max-w-none prose-headings:text-cyan-50 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}