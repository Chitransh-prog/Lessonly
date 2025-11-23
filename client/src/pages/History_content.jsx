import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";
import "highlight.js/styles/github.css";

export default function History_content() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");


  useEffect(() => {
    async function loadHistory() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      if (!userId) return;

      const { data, error } = await supabase
        .from("content")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!error) setItems(data);
    }

    loadHistory();
  }, []);

  // Highlight Markdown Code Blocks
  useEffect(() => {
    hljs.highlightAll();
  }, [items, editingId]);

//Edit
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

// Save
  const saveEdit = async (itemId) => {
    const { error } = await supabase
      .from("content")
      .update({ content: editContent })
      .eq("id", itemId);

    if (!error) {
      setItems((prev) =>
        prev.map((x) =>
          x.id === itemId ? { ...x, content: editContent } : x
        )
      );
      setEditingId(null);
    }
  };


  // 🗑 Delete Button

  const deleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const { error } = await supabase.from("content").delete().eq("id", itemId);

    if (!error) {
      setItems((prev) => prev.filter((x) => x.id !== itemId));
    }
  };

const downloadPDF = async (content, title) => {
  // ---- Create a fully isolated iframe ----
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.top = "-9999px";
  iframe.style.left = "-9999px";
  iframe.style.width = "800px";
  iframe.style.height = "1200px";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;

  // ---- Write clean HTML inside iframe ----
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
          }
          h1 { font-size: 24px; font-weight: bold; margin-bottom: 20px; }
          h2 { font-size: 20px; }
          h3 { font-size: 18px; }

          pre {
            background: #f4f4f4;
            padding: 12px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 13px;
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

  // ---- Wait for browser to paint ----
  await new Promise((res) => setTimeout(res, 300));

  // ---- Render PDF ----
  const canvas = await html2canvas(doc.body, {
    scale: 2,
    backgroundColor: "#ffffff",
  });

  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "pt", "a4");

  // ---- Watermark ----
  pdf.setFontSize(70);
  pdf.setTextColor(220, 220, 220);
  pdf.text(
    "LESSONLY",
    pdf.internal.pageSize.width / 2,
    pdf.internal.pageSize.height / 2,
    { angle: 45, align: "center" }
  );

  // ---- Add content snapshot ----
  const width = 550;
  const height = (canvas.height * width) / canvas.width;
  pdf.addImage(img, "PNG", 30, 30, width, height);

  pdf.save(`${title}.pdf`);

  // ---- Cleanup ----
  document.body.removeChild(iframe);
};

  return (
    <div className="min-h-screen pt-24 pb-24 w-[90%] max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Generated History</h1>

      {/* Hidden Clean PDF renderer */}
      <div
        id="pdf-clean-container"
        style={{
          position: "fixed",
          top: "-20000px",
          left: "-20000px",
          background: "white",
          color: "black",
          padding: "40px",
          width: "800px",
          zIndex: -9999,
        }}
      ></div>

      {items.length === 0 && (
        <p className="text-gray-500">No history found yet.</p>
      )}

      <div className="space-y-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-xl shadow border border-gray-200 relative"
          >
            {/* Top Controls */}
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-semibold">{item.title}</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="px-3 py-1 bg-black text-white rounded-lg text-xs"
                >
                  Edit
                </button>

                <button
                  onClick={() => downloadPDF(item.content, item.title)}
                  className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs"
                >
                  PDF
                </button>

                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Timestamp */}
            <p className="text-gray-400 text-sm mb-3">
              {new Date(item.created_at).toLocaleString()}
            </p>

            {/* Edit mode */}
            {editingId === item.id ? (
              <>
                <textarea
                  className="w-full h-60 border border-gray-300 rounded-lg p-3"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />

                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => saveEdit(item.id)}
                    className="px-4 py-2 bg-black text-white rounded-lg"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setEditingId(null)}
                    className="px-4 py-2 bg-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {item.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
