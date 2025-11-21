import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkUsageLimit } from "./createUsageLimit";
import { supabase } from "./supabase";
import markdownToTxt from "markdown-to-txt";
import markdownToPlain from "../utils/Makrdown";

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
    // ----------------------------------------------------------------------------
    // 🔥 STEP 1 — Get Logged-In User
    // ----------------------------------------------------------------------------
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      return "❌ Please login to use AI features.";
    }

    // ----------------------------------------------------------------------------
    // 🔥 STEP 2 — Enforce Usage Limit (200 requests/month)
    // ----------------------------------------------------------------------------
    const allowed = await checkUsageLimit(userId, 200);

    if (!allowed) {
      return "❌ You have reached your monthly AI usage limit.";
    }

    // ----------------------------------------------------------------------------
    // 🔥 STEP 3 — Initialize Gemini Model
    // ----------------------------------------------------------------------------
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    const prompt = `
    You are an AI that must follow strict formatting rules.

    TASK:
    Create "${type}" for the topic "${topic}".
    Summary: ${summary || "No summary provided"}
    Grade: ${grade}
    Tone: ${tone}
    Language: ${language}

    STRICT RULES:
    1. Do use Markdown.
    2. Do NOT use: #, *, -, _, ~, [, ], >.
    3. Do NOT use <b> tags.
    4. When making text bold
    5. Only output plain text.
    6. No headings like # or ###.
    7. No bullet points. Use numbered items:
       1. Example
       2. Example

    Now produce the final formatted output:
    `;

    const result = await model.generateContent(prompt);
    const raw = result.response.text();
    const response = markdownToPlain(raw);

    return response;
  } catch (error) {
    console.error(" Gemini API Error →", error);
    throw error;
  }
}
