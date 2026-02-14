// supabase/functions/generate-educational-content/index.ts

import { GoogleGenerativeAI } from "npm:@google/generative-ai";

// 1. Get Key
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req: Request) => {
  // 2. Handle CORS (Preflight)
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 3. Check API Key *Inside* the request loop and STOP if missing
    if (!GEMINI_API_KEY) {
      console.error("❌ FATAL: Missing GEMINI_API_KEY in Supabase Secrets");
      return json({ error: "Server misconfiguration: API Key missing" }, 500);
    }

    const ai = new GoogleGenerativeAI(GEMINI_API_KEY);
    const body = await req.json();
    const { topic, syllabus, summary, type, grade, tone, language } = body;

    // 4. Validate Input
    if (!topic) {
      return json({ error: "Topic is required" }, 400);
    }

    const prompt = `
    You are an expert educational content creator. 
    Create a **${type}** on the topic: **"${topic}"**.
    
    ## Context
    - **Grade:** ${grade || "General"}
    - **Tone:** ${tone || "Professional"}
    - **Language:** ${language || "English"}
    - **Syllabus:** ${syllabus || "N/A"}
    - **Summary:** ${summary || "N/A"}

    ## Formatting Rules (STRICT)
    1. **Do NOT** output plain text blocks.
    2. Use **# H1** for the Main Title.
    3. Use **## H2** for Section Headings.
    4. Use **### H3** for sub-points.
    5. Use **Bullet points (-)** for lists.
    6. Use **Bold (**text**)** for key terms.
    7. Use **Tables** if comparing items.
    8. **Strictly** output valid Markdown only.

    ## Structure
    1. Title
    2. Learning Objectives (Bulleted)
    3. Key Concepts (Definitions)
    4. Detailed Explanation (use subheadings)
    5. Real-world Examples
    6. Quiz (5 Questions with answers at the bottom)
    `;

    // 5. Model Initialization
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return json({ response: responseText });

  } catch (err: any) {
    console.error("❌ Edge Function Error:", err);
    return json({ error: err.message || "Internal Server Error" }, 500);
  }
});