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

// ❗ Remove raw HTML completely (to avoid hydration errors)
function sanitizeToMarkdown(input) {
  if (!input) return "";

  // AI returns JSON → convert to string
  let text =
    typeof input === "string"
      ? input
      : input?.response ||
        input?.content ||
        input?.markdown ||
        input?.text ||
        JSON.stringify(input, null, 2);

  // Remove all inline HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Fix broken HTML escaping from AI
  text = text.replace(/&lt;/g, "<").replace(/&gt;/g, ">");

  // Normalize spacing
  return text.replace(/\n{3,}/g, "\n\n").trim();
}

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

  const navigate = useNavigate();

  // Convert Markdown → HTML (for PDF)
  useEffect(() => {
    if (result) {
      const html = marked.parse(result);
      setRenderedHTML(html);
    }
  }, [result]);

  // Apply highlight.js
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
        content: cleaned,
        user_id,
      });
    } catch (err) {
      console.error(err);
      setResult("Error generating content.");
    }

    setLoading(false);
  };

  const downloadPDF = async () => {
    const content = result;
    const title = topic || "Generated Content";

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "900px";
    iframe.style.height = "2100px";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;

    doc.open();
    doc.write(`
      <html>
        <head>
          <style>
            body {
              background: white;
              color: black;
              font-family: Arial, sans-serif;
              padding: 40px;
              font-size: 14px;
              line-height: 1.6;
              width: 800px;
            }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
            pre {
              background: #f4f4f4;
              padding: 10px;
              border-radius: 5px;
              font-size: 13px;
              overflow-x: auto;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${marked.parse(content)}
        </body>
      </html>
    `);
    doc.close();

    await new Promise((r) => setTimeout(r, 300));

    const fullHeight = doc.body.scrollHeight;
    const pdf = new jsPDF("p", "pt", "a4");

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const canvasHeight = pageHeight * 2;
    let renderedHeight = 0;
    let pageIndex = 0;

    const logo = new Image();
    logo.src = "/Logo.png";

    logo.onload = async () => {
      while (renderedHeight < fullHeight) {
        const canvas = await html2canvas(doc.body, {
          scale: 2,
          y: renderedHeight,
          height: canvasHeight,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/png");
        const imgHeight = (canvas.height * pageWidth) / canvas.width;

        if (pageIndex > 0) pdf.addPage();
        pdf.setPage(pageIndex + 1);

        const logoW = 45;
        const logoH = (logo.height / logo.width) * logoW;
        const x = (pageWidth - logoW) / 2;
        const y = 10;

        pdf.addImage(logo, "PNG", x, y, logoW, logoH);

        pdf.setFontSize(6);
        pdf.setTextColor(80, 80, 80);
        pdf.text("Lessonly", pageWidth / 2, y + logoH + 10, {
          align: "center",
        });

        pdf.addImage(imgData, "PNG", 20, 60, pageWidth - 40, imgHeight);

        renderedHeight += canvasHeight;
        pageIndex++;
      }

      pdf.save(`${title}.pdf`);
      document.body.removeChild(iframe);
    };
  };

  return (
    <section className="min-h-screen w-full flex justify-center">
      <div className="w-[90%] max-w-3xl flex flex-col gap-10">
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
              <label className="text-sm font-medium">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
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
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
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
                className="border h-12 w-full rounded-lg border-gray-300 px-3"
                placeholder="Enter language"
              />
            </div>

            {/* Generate Button */}
            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-black text-white font-semibold text-xl flex items-center justify-center gap-2"
            >
              {loading ? "Generating..." : "Generate with AI"}
            </button>
          </form>
        </div>

        {/* ------------ CONTENT PREVIEW ------------ */}
        {result && (
          <div className="w-full mt-10 bg-white shadow-lg rounded-xl p-6">
            <div className="flex justify-end items-center mb-4 gap-3">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm"
              >
                {isEditing ? "Save" : "Edit"}
              </button>

              <button
                onClick={DownloadPDF}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm"
              >
                Download PDF
              </button>
            </div>

            {isEditing ? (
              <textarea
                className="w-full h-72 border border-gray-300 rounded-lg p-3"
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

</div>
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
