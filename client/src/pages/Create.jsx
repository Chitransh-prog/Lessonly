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
import "highlight.js/styles/github.css";
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

    // 👇 FIXED: Extract values from formData before using them
    const { topic, summary, type, grade, tone, language, syllabus } = formData;

    try {
      // 1. Generate Content
      const data = await generateEducationalContent({
        topic,
        summary,
        type,
        grade,
        tone,
        language,
        syllabus,
      });

      if (!data) throw new Error("No data received from AI");

      const cleaned = sanitizeToMarkdown(data);
      
      // ✅ SUCCESS: Show result immediately
      setResult(cleaned);

      // 2. Save to History (Non-blocking)
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
        console.warn("⚠️ Could not auto-save to history (likely duplicate):", saveError);
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

  return (
    <section className="min-h-screen w-full flex justify-center py-10">
      <div className="w-[90%] max-w-3xl flex flex-col gap-10">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col items-center mb-5">
            <img src="Logo.png" alt="logo" className="h-20 w-20" />
            <TextType className="text-3xl font-bold mt-2" text={["Content Generation"]} typingSpeed={100} pauseDuration={1500} />
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <input name="topic" value={formData.topic} onChange={handleInputChange} className="border h-12 w-full rounded-lg px-3" placeholder="Topic" required />
            <textarea name="syllabus" value={formData.syllabus} onChange={handleInputChange} className="border w-full rounded-lg p-3 h-20" placeholder="Syllabus (optional)" />
            <textarea name="summary" value={formData.summary} onChange={handleInputChange} className="border w-full rounded-lg p-3 h-20" placeholder="Summary (optional)" />
            
            <div className="grid grid-cols-2 gap-4">
                <select name="type" value={formData.type} onChange={handleInputChange} className="border h-12 rounded-lg px-3">
                    <option value="">Select Type</option>
                    <option value="Lesson Plan">Lesson Plan</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Study Notes">Study Notes</option>
                </select>
                <select name="grade" value={formData.grade} onChange={handleInputChange} className="border h-12 rounded-lg px-3">
                    <option value="">Select Grade</option>
                    <option value="High School">High School</option>
                    <option value="College/University">College/University</option>
                </select>
            </div>

            <button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-black text-white text-xl transition-opacity hover:opacity-90">
              {loading ? "Generating..." : "Generate with AI"}
            </button>
          </form>
        </div>

        {result && (
          <div className="w-full bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-end mb-4 gap-3">
              <button onClick={() => setIsEditing(!isEditing)} className="px-4 py-2 bg-gray-200 rounded-lg">
                {isEditing ? "Done" : "Edit"}
              </button>
              <button onClick={() => handleDownloadPDF(result, formData.topic || "Document")} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Download PDF
              </button>
            </div>

            {isEditing ? (
              <textarea className="w-full h-96 border rounded-lg p-3 font-mono" value={result} onChange={(e) => setResult(e.target.value)} />
            ) : (
              <div className="prose max-w-none border-t pt-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}