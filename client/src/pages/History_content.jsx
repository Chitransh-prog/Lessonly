import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import { generatePDFFromMarkdown } from "@/utils/pdfGenerator";
import { useNavigate } from "react-router-dom";

import "highlight.js/styles/github.css";

export default function History_content() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const navigate =useNavigate();
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


  const startEdit = (item) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

 
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

 
  const deleteItem = async (itemId) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;

    const { error } = await supabase.from("content").delete().eq("id", itemId);

    if (!error) {
      setItems((prev) => prev.filter((x) => x.id !== itemId));
    }
  };


  // This function is greatly simplified now
const handleDownloadPDF = (content, title) => {
  generatePDFFromMarkdown(content, {
    title: title,
    filename: `${title}.pdf`,
    watermarkText: "LESSONLY", 
    headerText: "LESSONLY",
    headerImageUrl: "/Logo.png", 
  });
};

  return (
    <div className="min-h-screen pt-24 pb-24 w-[90%] max-w-4xl mx-auto">
      <img onClick={()=>navigate("/create")}  src="return.png" className="h-10 w-10 bg-[#101828] text-white text-lg rounded-lg absolute top-24 left-10 flex items-center justify-center gap-2" />
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
                  onClick={() => handleDownloadPDF(item.content, item.title)}
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