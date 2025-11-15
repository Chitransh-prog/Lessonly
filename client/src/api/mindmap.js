import { supabase } from "../lib/supabase";

export async function saveMindmapToDB({ name, mindmap_json, source_text, user_id }) {
  const { data, error } = await supabase
    .from("mindmap")
    .insert([
      {
        name,
        mindmap_json,
        source_text,
        user_id,
      },
    ])
    .select("*");

  if (error) {
    console.error("❌ Failed to save mindmap:", error);
    throw error;
  }

  return data[0];
}
