import { useState, useEffect } from "react";
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

// Clean Markdown
function sanitizeToMarkdown(input) {
  if (!input) return "";

  let text =
    typeof input === "string"
      ? input
      : input?.response ||
        input?.content ||
        input?.markdown ||
        input?.text ||
        JSON.stringify(input, null, 2);

  text = text.replace(/<[^>]*>/g, "");
  text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  return text.replace(/\n{3,}/g, "\n\n").trim();
}

export default function Create() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("");
  const [grade, setGrade] = useState("");
  const [tone, setTone] = useState("");
  const [language, setLanguage] = useState("");
  const [syllabus, setSyllabus] = useState("");

  const [result, setResult] = useState("");
  const [renderedHTML, setRenderedHTML] = useState("");

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  // Markdown → HTML for PDF
  useEffect(() => {
    if (result) {
      setRenderedHTML(marked.parse(result));
    }
  }, [result]);

  // Syntax highlighting
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

      const cleaned = sanitizeToMarkdown(data);
      setResult(cleaned);

      const user_id = await getUserId();

      await saveGeneratedContent({
        title: topic,
        description: summary || "",
        syllabus: syllabus || "",
        content: cleaned,
        user_id,
      });
    } catch (err) {
      console.error(err);
      setResult("Error generating content.");
    }

    setLoading(false);
  };

  // FIXED: Taken arguments correctly
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
    <section className="min-h-screen w-full flex justify-center">
      <div className="w-[90%] max-w-3xl flex flex-col gap-10">

        {/* FORM */}
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
                className="border h-12 w-full rounded-lg px-3"
                placeholder="Enter your Topic"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Syllabus</label>
              <textarea
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                className="border w-full rounded-lg p-3 h-20"
                placeholder="Enter syllabus details (optional)"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Optional Summary</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="border w-full rounded-lg p-3 h-20"
                placeholder="Enter optional summary"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Select Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="border h-12 w-full rounded-lg px-3"
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
              <label className="text-sm font-medium">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="border h-12 w-full rounded-lg px-3"
              >
                <option>Select Grade</option>
                <option value="College/University">College/University</option>
                <option value="High School">High School</option>
                <option value="Senior Secondary">Senior Secondary</option>
                <option value="Elementary">Elementary</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="border h-12 w-full rounded-lg px-3"
              >
                <option>Select Tone</option>
                <option value="Technical">Technical</option>
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
                className="border h-12 w-full rounded-lg px-3"
                placeholder="Enter language"
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-black text-white text-xl flex items-center justify-center"
            >
              {loading ? "Generating..." : "Generate with AI"}
            </button>
          </form>
        </div>

        {/* PREVIEW */}
        {result && (
          <div className="w-full mt-10 bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-end mb-4 gap-3">
              
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-black text-white rounded-lg"
              >
                {isEditing ? "Save" : "Edit"}
              </button>

              {/* ⭐ FIXED BUTTON */}
              <button
                onClick={() => handleDownloadPDF(result, topic || "Document")}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Download PDF
              </button>
            </div>

            {isEditing ? (
              <textarea
                className="w-full h-72 border rounded-lg p-3"
                value={result}
                onChange={(e) => setResult(e.target.value)}
              />
            ) : (
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, className, children, ...props }) {
                      const codeString = String(children || "").trim();
                      return inline ? (
                        <code className={className} {...props}>
                          {codeString}
                        </code>
                      ) : (
                        <pre>
                          <code className={className} {...props}>
                            {codeString}
                          </code>
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
        )}

        {/* HISTORY BUTTON */}
        <button
          onClick={() => navigate("/create-history")}
          className="h-10 w-32 bg-[#101828] text-white text-lg rounded-lg absolute top-24 right-60 flex items-center justify-center gap-2"
        >
          <img src="history.svg" className="h-4" />
          History
        </button>
      </div>
    </section>
  );
}
