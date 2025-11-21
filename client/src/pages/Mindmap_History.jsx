import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { getMindmapHistory } from "@/api/getMindmapHistory";

export default function Mindmaps_History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create signed URL
  const getSignedUrl = async (path) => {
    const { data, error } = await supabase.storage
      .from("Lessonly") // bucket name (lowercase)
      .createSignedUrl(path, 60 * 60); // 1 hour

    if (error) {
      console.error("Signed URL error:", error);
    }

    return data?.signedUrl;
  };

  // Clean old DB records that stored a FULL URL instead of path
  const cleanPath = (thumbnailPath) => {
    if (!thumbnailPath) return null;

    // Convert:
    // https://xyz.supabase.co/storage/v1/object/public/Lessonly/thumb.png
    // ---> Lessonly/thumb.png
    return thumbnailPath.replace(/^https?:\/\/.*\/object\/public\//, "");
  };

  useEffect(() => {
    const fetchData = async () => {
      const originalData = await getMindmapHistory();

      const itemsWithSignedUrl = await Promise.all(
        originalData.map(async (item) => {
          const path = cleanPath(item.thumbnail_path);

          const signedUrl = await getSignedUrl(path);

          return {
            ...item,
            cleanedPath: path,
            signedUrl,
          };
        })
      );

      setItems(itemsWithSignedUrl);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <h1>Loading...</h1>;

  return (
    <div className="min-h-screen pt-24 pb-24 w-[90%] max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Mindmaps History</h1>

      {items.length === 0 && (
        <p className="text-gray-500">No mindmaps found yet.</p>
      )}

      <div className="space-y-5">
        {items.map((item) => (
          <div
            key={`${item.id}-${item.cleanedPath}`} // unique key fix
            className="p-5 bg-white rounded-xl shadow border"
          >
            <img
              src={item.signedUrl}
              alt="thumb"
              className="w-150 h-64 object-cover border border-gray-700 mb-3"
            />

            <h2 className="text-xl font-semibold">{item.name}</h2>

            <p className="text-gray-400 text-sm mb-3">
              {new Date(item.created_at).toLocaleString()}
            </p>

            <p className="text-gray-800 whitespace-pre-wrap mb-3">
              {item.source_text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
