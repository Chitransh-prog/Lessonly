import { supabase } from "@/lib/supabase";

export async function generateMindmapFromPdf(extractedText: string) {
  try {
    const { data, error } = await supabase.functions.invoke("create-mindmap", {
      body: { text: extractedText },
    });

    if (error) throw error;

    return data; // this already IS your JSON output
  } catch (error) {
    console.error("Mindmap creation failed:", error);
    throw error;
  }
}
