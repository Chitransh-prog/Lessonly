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

  // -------------------------------
  // Load user's saved content
  // -------------------------------
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

  // Highlight markdown code blocks
  useEffect(() => {
    hljs.highlightAll();
  }, [items, editingId]);

  // -------------------------------
  // Start Editing
  // -------------------------------
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  // -------------------------------
  // Save Edited Content
  // -------------------------------
  const saveEdit = async (itemId) => {
    const { error } = await supabase
      .from("content")
      .update({ content: editContent })
      .eq("id", itemId);

    if (!error) {
      setItems((prev) =>
        prev.map((x) => (x.id === itemId ? { ...x, content: editContent } : x))
      );
      setEditingId(null);
    }
  };

  // -------------------------------
  // Delete Content
  // -------------------------------
  const deleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const { error } = await supabase.from("content").delete().eq("id", itemId);

    if (!error) {
      setItems((prev) => prev.filter((x) => x.id !== itemId));
    }
  };

  // -------------------------------
  // PDF GENERATION (Perfect Multi-Page)
  // -------------------------------
  const downloadPDF = async (content, title) => {
    // Create isolated iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    iframe.style.width = "900px";
    iframe.style.height = "2000px";
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument;

    // Clean HTML for PDF snapshot
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

    await new Promise((r) => setTimeout(r, 300)); // wait for layout

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

        // ----- Small Logo + Lessonly -----
        const logoW = 45;
        const logoH = (logo.height / logo.width) * logoW;
        const x = (pageWidth - logoW) / 2;
        const y = 10;

        pdf.addImage(logo, "PNG", x, y, logoW, logoH);

        pdf.setFontSize(7);
        pdf.setTextColor(80, 80, 80);
        pdf.text("LESSONLY", pageWidth / 2, y + logoH + 10, {
          align: "center",
        });

        // ----- Page Content -----
        pdf.addImage(imgData, "PNG", 20, 60, pageWidth - 40, imgHeight);

        renderedHeight += canvasHeight;
        pageIndex++;
      }

      pdf.save(`${title}.pdf`);
      document.body.removeChild(iframe);
    };
  };

  // -------------------------------
  // RETURN UI
  // -------------------------------
  return (
    <div className="min-h-screen pt-24 pb-24 w-[90%] max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Generated History</h1>

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
