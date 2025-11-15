import { GoogleGenerativeAI } from "@google/generative-ai";
import GetNodesAndEdges from "@/utils/GetNodesAndEdges";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(apiKey);

export const fetchApiResponse_Mindmap = async (text) => {
  const systemInstruction = `
You generate clean hierarchical OUTLINES.
Return ONLY plain text, NEVER JSON.
Each bullet must contain a label and a multi-sentence explanation.
`;

  const outlinePrompt = `
Extract a clean hierarchical OUTLINE with detailed explanations.

OUTPUT RULES:
- Output ONLY an outline, NEVER JSON.
- EXACT FORMAT:

Root: 2–4 sentence detailed explanation
- Child 1: 2–4 sentence detailed explanation
  - Subchild 1: 2–4 sentence explanation
  - Subchild 2: 2–4 sentence explanation
- Child 2: 2–4 sentence explanation

STRUCTURE RULES:
- Max depth = 3
- Max 5 children per parent
- Labels must remain SHORT (2–4 words)
- Explanations must be DETAILED paragraphs (2–4 sentences each)
- Use ONLY:
  • hyphens for bullets
  • colons for explanation start
  • letters, numbers, spaces

Do NOT return markdown.  
Do NOT wrap in code blocks.  
Do NOT return JSON.

TEXT INPUT:
${text}
`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
    });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: outlinePrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 4096,
        responseMimeType: "text/plain",
      },
    });

    const outline = await response.response.text();
    console.log("🔹 OUTLINE:\n", outline);

    const { nodes, edges } = GetNodesAndEdges(outline);

    console.log("🔹 NODES:", nodes);
    console.log("🔹 EDGES:", edges);

    return { nodes, edges };
  } catch (error) {
    console.error("Gemini Mindmap API Error:", error);
    return { nodes: [], edges: [] };
  }
};
