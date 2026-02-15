// supabase/functions/generate-educational-content/index.ts

import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

    const body = await req.json().catch(() => ({}));
    const { topic, syllabus, summary, type, grade, tone, language } = body;

    if (!topic) return json({ error: "Topic is required" }, 400);

    // --- ENHANCED PROMPT FOR STRUCTURAL CLARITY ---
    const prompt = `
    You are an expert educational content creator. Your output is used to generate professional PDFs. 
    The current version is failing because it generates a "wall of text" without enough spacing.

    **Task:** Create a detailed **${type || "Lesson Plan"}** on the topic: **"${topic}"**.
    
    **Context:**
    - Grade Level: ${grade || "High School"}
    - Tone: ${tone || "Professional"}
    - Language: ${language || "English"}
    ${syllabus ? `- Syllabus: ${syllabus}` : ""}
    ${summary ? `- Focus Area: ${summary}` : ""}

    ## 🚨 MANDATORY FORMATTING RULES (STRICT COMPLIANCE REQUIRED) 🚨
    1. **Double Newlines:** You MUST put TWO empty lines (\\n\\n) between every heading and every paragraph. 
    2. **Sectioning:** Start every major section with ## and a roman numeral (e.g., ## I. Overview).
    3. **No Merging:** Never put a header and a paragraph on the same line.
    4. **Lists:** Use a dash followed by a space (- ) for bullet points. Ensure each point is on a new line with a blank line between the list and the preceding text.
    5. **Bold Terms:** Use **Term:** followed by the definition. 
    6. **No Chat:** Start immediately with the # Title. Do not say "Sure" or "Here is your plan".

    ## DOCUMENT STRUCTURE
    # ${topic}

    ## I. Overview
    (Provide a clear summary here. Ensure there is a blank line above and below this paragraph.)

    ## II. Learning Objectives
    (Use a bulleted list. Each objective must be on its own line.)

    ## III. Key Concepts
    (Use **Term:** Definition format. Use sub-headings ### if needed for categories.)

    ## IV. Lesson Procedure
    (Break this into ### A. Introduction, ### B. Explanation, etc.)

    ## V. Quiz & Assessment
    (List 5 clear questions.)

    ---
    **Answer Key:**
    (Provide answers at the very bottom.)
    `;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return json({ response: responseText });

  } catch (err: any) {
    console.error("❌ Edge Function Error:", err);
    return json({ error: err.message || "Internal Server Error" }, 500);
  }
});