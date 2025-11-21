import { supabase } from "../lib/supabase";

async function getMindmapHistory() {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;

  if (!userId) console.log("Can't get user id");

  const { data, error } = await supabase
    .from("mindmap")
    .select("created_at,name,source_text,thumbnail_path")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!error) {
    console.log("Got the data!: ", data);
    return data;
  }
}

export { getMindmapHistory };
