import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
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
    1. Do NOT use Markdown.
    2. Do NOT use: #, *, -, _, ~, [, ], >.
    3. Do NOT use <b> tags.
    4. When making text bold, wrap it like this: [BOLD]Example Text[/BOLD]
    5. Only output plain text.
    6. No headings like # or ###.
    7. No bullet points. Use numbered items:
      1. Example
      2. Example

    Now produce the final formatted output:
    `;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error(" Gemini API Error →", error);
    throw error;
  }
}
