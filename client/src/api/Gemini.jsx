import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import GetNodesAndEdges from "@/utils/GetNodesAndEdges";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(apiKey);

export const fetchApiResponse_Mindmap = async (text) => {
  // 1. SYSTEM: Balanced Persona
  const systemInstruction = `
You are an educational synthesizer. 
Your goal is to create a mindmap that is visually simple (few nodes) but intellectually satisfying (rich details).
`;

  // 2. PROMPT: The "Rich but Structured" Configuration
  const outlinePrompt = `
Create a structured Mindmap Outline.

### STRICT VISUAL STRUCTURE (Low Complexity):
1. **Root Node**: 1 Main Topic.
2. **Branches**: EXACTLY 3 Main Concepts.
3. **Leaves**: EXACTLY 2 Supporting Points per Concept.
(Total: ~10 nodes. Do not add more branches.)

### CONTENT RULES (High Detail):
- **Labels**: Clear and descriptive (2-5 words).
- **Explanations**: **NO single-liners.**
  - Write **2-3 clear sentences** (approx 30-50 words) for every node.
  - Explain the *context*: Don't just define *what* it is, explain *how* it works or *why* it matters.
  - Provide specific examples or data if present in the text.

### EXACT OUTPUT FORMAT:
Root: [Topic] : [2-3 sentence summary of the entire document's core message.]
- [Concept 1] : [2-3 sentences explaining this concept's role and importance.]
  - [Detail A] : [2-3 sentences providing specific evidence, mechanism, or example.]
  - [Detail B] : [2-3 sentences providing specific evidence, mechanism, or example.]
- [Concept 2] : [2-3 sentences explaining this concept's role and importance.]
  - [Detail A] : [2-3 sentences providing specific evidence, mechanism, or example.]
  - [Detail B] : [2-3 sentences providing specific evidence, mechanism, or example.]
- [Concept 3] : [2-3 sentences explaining this concept's role and importance.]
  - [Detail A] : [2-3 sentences providing specific evidence, mechanism, or example.]
  - [Detail B] : [2-3 sentences providing specific evidence, mechanism, or example.]

### TEXT INPUT:
${text}
`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      systemInstruction,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: outlinePrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2, // Slightly relaxed to allow for better sentence flow
        maxOutputTokens: 2500, // Increased limit to allow for the extra details
        responseMimeType: "text/plain",
      },
    });

    let outline = await response.response.text();

    // CLEANING
    outline = outline
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\*\*/g, "")
      .replace(/^Here is.*:/i, "")
      .trim();

    console.log("🔹 RAW CLEANED OUTLINE:\n", outline);

    if (!outline)
      throw new Error(
        "AI returned empty response (Safety Block or Context Error)"
      );

    const { nodes, edges } = GetNodesAndEdges(outline);

    return { nodes, edges };
  } catch (error) {
    console.error("Gemini Mindmap API Error:", error);
    return { nodes: [], edges: [] };
  }
};
