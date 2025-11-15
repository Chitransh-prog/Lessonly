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
    Create "${type}" for the topic "${topic}".
    Summary: ${summary || "No summary provided"}
    Grade Level: ${grade}
    Tone: ${tone}
    Language: ${language}`



    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("🔥 Gemini API Error →", error);
    throw error;
  }
}