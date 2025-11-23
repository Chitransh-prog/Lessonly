import { useState, useEffect } from "react";
import TextType from "../animations/TextType";
import { generateEducationalContent } from "../lib/gemini";
import { saveGeneratedContent } from "../api/content";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
import "highlight.js/styles/github.css";
import { generatePDFFromMarkdown } from "@/utils/pdfGenerator";

export default function Create() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("");
  const [grade, setGrade] = useState("");
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [renderedHTML, setRenderedHTML] = useState("");

  const navigate = useNavigate();

  // Convert Markdown → HTML for PDF rendering
  useEffect(() => {
    if (result) {
      const html = marked.parse(result);
      setRenderedHTML(html);
    }
  }, [result]);

  // Highlight code blocks
  useEffect(() => {
    document.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  }, [result, isEditing]);

  const getUserId = async () => {
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await generateEducationalContent({
        topic,
        summary,
        type,
        grade,
        tone,
        language,
      });

      setResult(data);

      const user_id = await getUserId();
      await saveGeneratedContent({
        title: topic,
        description: summary || "",
        content: data,
        user_id,
      });

      alert("Content saved successfully!");
    } catch (err) {
      console.error(err);
      setResult("Error generating content.");
    }

    setLoading(false);
  };

  return (
    <section className="min-h-screen w-full flex justify-center">
      <div className="w-[90%] max-w-3xl flex flex-col gap-10">

        {/* ---------------- Hidden PDF Render Area ---------------- */}
        <div
          id="pdf-render-area"
          className="prose max-w-none p-10 hidden"
          dangerouslySetInnerHTML={{ __html: renderedHTML }}
        ></div>

        
        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col items-center mb-5">
            <img src="Logo.png" alt="logo" className="h-20 w-20" />
            <TextType
              className="text-3xl font-bold mt-2"
              text={["Content Generation"]}
              typingSpeed={200}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
            />
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="text-sm font-medium">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
                placeholder="Enter your Topic"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Optional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="border w-full rounded-lg border-gray-300 p-3 h-20"
                placeholder="Enter optional summary"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Select Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
              >
                <option>Select Type</option>
                <option value="Lesson Plan">Lesson Plan</option>
                <option value="Quiz">Quiz</option>
                <option value="Study Notes">Study Notes</option>
                <option value="Short Summary">Short Summary</option>
                <option value="Long Explanation">Long Explanation</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Grade Level</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
              >
                <option>Select Grade</option>
                <option value="High School">High School</option>
                <option value="Senior Secondary">Senior Secondary</option>
                <option value="Elementary">Elementary</option>
                <option value="Primary">Primary</option>
                <option value="Pre-Primary">Pre-Primary</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
              >
                <option>Select Tone</option>
                <option value="Professional/Formal">Professional/Formal</option>
                <option value="Academic">Academic</option>
                <option value="Informal">Informal</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Language</label>
              <input
                type="text"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
                placeholder="Enter language"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-black text-white font-semibold text-xl flex items-center justify-center gap-2"
            >
              {loading ? "Generating with AI..." : "Generate with AI"}
              {!loading && <img src="AI.svg" alt="AI" className="h-6" />}
            </button>
          </form>
        </div>

        {result && (
          <div className="w-full mt-10 bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Generated Content</h2>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                >
                  {isEditing ? "Save" : "Edit"}
                </button>

                <button
                onClick={async () => {
                  try {
                    await generatePDFFromMarkdown(result, {
                      title: topic || "Generated Content",
                      watermarkText: "LESSONLY", 
                      watermarkImageUrl: "/mnt/data/19ad8e01-d2cb-4e1d-a5f0-8f376726b585.png",
                      filename: `${topic || "generated-content"}.pdf`,
                    });
                  } catch (err) {
                    console.error("PDF generation failed", err);
                    alert("PDF generation failed. Check console for details.");
                  }
                }}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Download PDF
              </button>

              </div>
            </div>

            {isEditing ? (
              <textarea
                className="w-full h-72 border border-gray-300 rounded-lg p-3 text-gray-800"
                value={result}
                onChange={(e) => setResult(e.target.value)}
              />
            ) : (
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children }) {
                      return (
                        <pre>
                          <code className={className}>{children}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {result}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}<button onClick={()=>navigate("/create-history")} className="h-10 w-32 bg-[#101828] text-white text-lg rounded-lg absolute top-24 right-16 flex items-center justify-center gap-2">
            <img src="history.svg" className="h-4" />
            History
          </button>
      </div>
    </section>
  );
}
