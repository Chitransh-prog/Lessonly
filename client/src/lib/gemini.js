import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUsageLimit } from "./createUsageLimit";
import { supabase } from "./supabase";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ Missing API Key! Add VITE_GEMINI_API_KEY in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function generateEducationalContent({
  topic,
  summary,
  type,
  grade,
  tone,
  language,
}) {
  try {
    // --------------------------------------------------
    // 🔥 STEP 1 — Check authenticated user
    // --------------------------------------------------
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) return "❌ Please login to use AI features.";

    // --------------------------------------------------
    // 🔥 STEP 2 — Usage Limit (200/month)
    // --------------------------------------------------
    const allowed = await checkUsageLimit(userId, 200);
    if (!allowed) {
      return "❌ You have reached your monthly AI usage limit.";
    }

    // --------------------------------------------------
    // 🔥 STEP 3 — Initialize Gemini properly
    // --------------------------------------------------
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // more stable than lite
    });

    // --------------------------------------------------
    // 🔥 IMPROVED PROMPT — Clean Markdown Output
    // --------------------------------------------------
    const prompt = `
You are an advanced educational content generator.
Produce **clean, well-structured Markdown**, optimized for readability.

### Requirements:

- Topic: **${topic}**
- Summary: ${summary || "None"}
- Content Type: **${type}**
- Grade Level: **${grade}**
- Tone: **${tone}**
- Language: **${language}**

### Formatting Rules:

- Use **proper Markdown** including:
  - Headings
  - Paragraphs
  - Numbered lists
  - Sub-sections
  - Code blocks (if needed)
  - Tables (if helpful)

- ALWAYS format nicely:
  - Good spacing
  - Clean sections
  - Headers must look professional
  - Do **not** remove Markdown symbols
  - Do **not** flatten the Markdown

- If creating a lesson plan, quiz, notes, or explanation:
  - Use sections like:
    - Overview
    - Key Concepts
    - Steps / Explanation
    - Examples
    - Summary
    - Quiz (Optional)
    - Answer Key (Optional)

### Output:
Write only **Markdown**, nothing else.
    `;

    // --------------------------------------------------
    // 🔥 STEP 4 — Generate
    // --------------------------------------------------
    const result = await model.generateContent(prompt);
    const markdown = result.response.text();

    return markdown;
  } catch (error) {
    console.error("🔥 Gemini API Error →", error);
    return "❌ Error generating content. Please try again.";
  }
}
