import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function History_content() {
  const [items, setItems] = useState([]);

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

  return (
    <div className="min-h-screen pt-24 pb-24 w-[90%] max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Generated History</h1>

      {items.length === 0 && (
        <p className="text-gray-500">No history found yet.</p>
      )}

      <div className="space-y-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-xl shadow border border-gray-200"
          >
            <h2 className="text-xl font-semibold">{item.title}</h2>

            <p className="text-gray-400 text-sm mb-3">
              {new Date(item.created_at).toLocaleString()}
            </p>

            <p className="whitespace-pre-wrap text-gray-800">
              {item.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
