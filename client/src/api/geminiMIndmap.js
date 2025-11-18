import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function generateMindmapGemini(sourceText) {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",   // ⭐ Newest & safest model
    });

    const prompt = `
You are a mindmap generator. Convert the following text into a structured mindmap.

TEXT:
${sourceText}

OUTPUT RULES:
- Respond ONLY with a JSON object.
- DO NOT include markdown.
- DO NOT add explanations.
- IDs must be numeric strings ("1", "2", "3"...)
- Format exactly:

{
  "nodes": [
    { "id": "1", "data": {"label": "Root Topic"}, "position": {"x": 0, "y": 0} }
  ],
  "edges": [
    { "id": "e1-2", "source": "1", "target": "2" }
  ]
}

Create:
- 1 root node (main idea)
- 3–8 major branches
- Sub-branches as needed
`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();

    // Clean accidental code fences
    text = text.replace(/```json|```/g, "").trim();

    // Auto-fix JSON errors
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn("Gemini returned invalid JSON. Attempting repair...");
      
      // Repair trick: remove trailing commas
      const fixed = text.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
      return JSON.parse(fixed);
    }

  } catch (error) {
    console.error("❌ Gemini Mindmap Error:", error);
    throw error;
  }
}
