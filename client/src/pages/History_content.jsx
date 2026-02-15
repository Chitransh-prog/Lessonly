import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import hljs from "highlight.js";
import { generatePDFFromMarkdown } from "@/utils/pdfGenerator";
import { useNavigate } from "react-router-dom";

// Switched to Dark theme for code blocks to match the UI
import "highlight.js/styles/github-dark.css"; 

export default function History_content() {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const navigate = useNavigate();

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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-x-hidden pt-28 pb-24 px-4">
      
      {/* Background Ambience */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Return Button */}
      <div className="absolute top-8 left-4 md:left-10 z-20">
        <button 
            onClick={() => navigate("/create")}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/80 hover:border-cyan-400/50 transition-all backdrop-blur-md"
        >
            <img src="return.png" className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Back" />
            <span className="text-slate-300 group-hover:text-white text-sm font-medium">Back to Create</span>
        </button>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 animate-fadeIn">
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
            Your Generated History
        </h1>
        <p className="text-slate-400 mb-8">
            Review, edit, or download your past AI generations.
        </p>

        {items.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
            <p className="text-slate-500 text-lg">No history found yet.</p>
            <button onClick={() => navigate("/create")} className="mt-4 text-cyan-400 hover:underline">Create your first content →</button>
          </div>
        )}

        <div className="space-y-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl hover:border-white/20 transition-colors duration-300"
            >
              {/* Top Controls */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-white mb-1">{item.title}</h2>
                    <p className="text-slate-500 text-sm font-mono">
                        {new Date(item.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-700 hover:text-white transition-colors"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDownloadPDF(item.content, item.title)}
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-0.5"
                  >
                    PDF
                  </button>

                  <button
                    onClick={() => deleteItem(item.id)}
                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Edit mode */}
              {editingId === item.id ? (
                <div className="animate-fadeIn">
                  <textarea
                    className="w-full h-96 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-slate-200 font-mono text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none resize-y"
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />

                  <div className="flex gap-3 mt-4 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="px-5 py-2.5 bg-cyan-500 text-slate-900 font-bold rounded-xl hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                /* Markdown View - Using prose-invert for dark mode text */
                <div className="prose prose-invert prose-lg max-w-none 
                    prose-headings:text-cyan-50 
                    prose-a:text-cyan-400 hover:prose-a:text-cyan-300 
                    prose-strong:text-white
                    prose-code:text-cyan-200 prose-code:bg-slate-800/50 prose-code:px-1 prose-code:rounded
                    prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800"
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}