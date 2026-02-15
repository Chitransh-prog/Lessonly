import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { getMindmapHistory } from "@/api/getMindmapHistory";
import { useNavigate } from "react-router-dom";

export default function Mindmaps_History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Create signed URL
  const getSignedUrl = async (path) => {
    if (!path) return null;
    const { data, error } = await supabase.storage
      .from("Lessonly")
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) {
      console.error("Signed URL error:", error);
      return null;
    }

    return data?.signedUrl;
  };

  // Clean old DB records that stored a FULL URL instead of path
  const cleanPath = (thumbnailPath) => {
    if (!thumbnailPath) return null;
    return thumbnailPath.replace(/^https?:\/\/.*\/object\/public\//, "");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const originalData = await getMindmapHistory();

        if (originalData) {
          const itemsWithSignedUrl = await Promise.all(
            originalData.map(async (item) => {
              const path = cleanPath(item.thumbnail_path);
              const signedUrl = await getSignedUrl(path);
              return { ...item, cleanedPath: path, signedUrl };
            })
          );
          setItems(itemsWithSignedUrl);
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
            <p className="text-slate-400 animate-pulse">Loading History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-[#1e293b] to-slate-900 relative overflow-x-hidden pt-28 pb-24 px-4">
      
      {/* Background Ambience */}
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-[400px] h-[400px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Return Button */}
      <div className="absolute top-8 left-4 md:left-10 z-20">
        <button 
            onClick={() => navigate("/mindmaps")}
            className="group flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:bg-slate-700/80 hover:border-cyan-400/50 transition-all backdrop-blur-md"
        >
            <img src="return.png" className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" alt="Back" />
            <span className="text-slate-300 group-hover:text-white text-sm font-medium">Back to Studio</span>
        </button>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 animate-fadeIn">
        
        {/* Header */}
        <div className="mb-10">
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-md">
                Your Mindmaps History
            </h1>
            <p className="text-slate-400">
                Resume or view your previously generated visual maps.
            </p>
        </div>

        {items.length === 0 && (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md">
            <p className="text-slate-500 text-lg">No mindmaps found yet.</p>
            <button onClick={() => navigate("/mindmaps")} className="mt-4 text-cyan-400 hover:underline">Create your first mindmap →</button>
          </div>
        )}

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.cleanedPath}`}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-xl hover:bg-white/10 hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              onClick={() => navigate(`/view/${item.id}`)}
            >
              {/* Thumbnail Container */}
              <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 bg-slate-900/50 border border-white/5">
                {item.signedUrl ? (
                  <img
                    src={item.signedUrl}
                    alt={item.name}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <span className="text-xs">No Preview</span>
                  </div>
                )}
                
                {/* Overlay Icon */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 bg-black/50 rounded-full backdrop-blur-md flex items-center justify-center border border-white/20">
                        <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h2 className="text-lg font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
                        {item.name}
                    </h2>
                </div>
                
                <p className="text-xs text-slate-500 mb-3 font-mono">
                  {new Date(item.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </p>

                <div className="mt-auto pt-3 border-t border-white/10">
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                    <span className="text-slate-600 font-semibold uppercase tracking-wider text-[10px] mr-1">Source:</span>
                    {item.source_text || "Uploaded File"}
                    </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}