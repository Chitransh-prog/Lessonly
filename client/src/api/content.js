import { supabase } from "../lib/supabase";

export async function saveGeneratedContent({ title, description, content, user_id }) {
  const { data, error } = await supabase
    .from("content")
    .insert([
      {
        title,
        description,
        content,
        user_id,
      },
    ])
    .select("*");

  if (error) {
    console.error("Failed to save content:", error);
    throw error;
  }

  return data[0]; 
}
