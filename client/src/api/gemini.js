import { supabase } from "@/lib/supabase";
import { checkUsageLimit } from "@/utils/createUsageLimit";

export async function generateEducationalContent({
  topic,
  syllabus,
  summary,
  type,
  grade,
  tone,
  language,
}) {
  try {
    // 1️⃣ Check User Auth
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) return "❌ Please login to use AI features.";

    // 2️⃣ Check Usage Limit (Frontend or Edge)
    const allowed = await checkUsageLimit(userId, 200);
    if (!allowed) {
      return "❌ You have reached your monthly AI usage limit.";
    }

    // 3️⃣ Call your edge function
    const { data, error } = await supabase.functions.invoke("create-content", {
      body: { topic, syllabus, summary, type, grade, tone, language },
    });

    if (error) {
      console.log("❌ Error from edge function:", error);
      throw error;
    }

    return data; // contains markdown
  } catch (error) {
    console.error("❌ Content generation failed:", error);
    throw error;
  }
}
