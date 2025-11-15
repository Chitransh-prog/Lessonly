import { GoogleGenerativeAI } from "@google/generative-ai";
import { mindmapSchema } from "../utils/MindmapSchema";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(apiKey);

export const fetchApiResponse_Mindmap = async (text) => {
  const systemInstruction = `
You are a Mindmap JSON Generator.

Your ONLY task is to convert text into a clean hierarchical mindmap that matches the JSON schema EXACTLY.

====================
SCHEMA REQUIREMENTS
====================

A node MUST follow this structure:
{
  "id": string,
  "type": "baseNodeFull",
  "data": {
    "label": string (max 60 chars),
    "detail": string (max 200 chars, optional)
  },
  "position": { "x": number, "y": number }
}

Edges MUST follow this structure:
{
  "id": string,
  "source": string,
  "target": string
}

====================
MINDMAP RULES
====================

- MAX nodes: 25 total
- MAX depth: 3
- MAX 3 children per node
- Do NOT duplicate children for different parents
- If the text is long, summarize subtopics instead of producing many nodes

====================
POSITION RULES
====================

Use these formulas:
- Y = depth * 220
- X = index * 300

Depth 0 (root): (0,0)
Depth 1 X indices: -2, -1, 0, 1, 2

Depth 2 and 3:
- Children should be positioned relative to their parent.
- Spread siblings horizontally using index * 300.

====================
OUTPUT RULES
====================

- Output ONLY valid JSON (no comments, no text outside JSON).
- JSON MUST MATCH the schema EXACTLY.
- NEVER truncate the JSON.
- ALWAYS close all brackets and arrays.
- If output becomes too long, shorten text BUT KEEP JSON VALID.
`;

  try {
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction,
      responseSchema: mindmapSchema,
    });

    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `
Generate a structured mindmap from this text. 
Return ONLY JSON that matches the provided schema.

TEXT INPUT:
${text}
`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8000,
        responseMimeType: "application/json",
      },
    });

    const raw = await response.response.text();

    if (!raw.trim().startsWith("{") || !raw.trim().endsWith("}")) {
      console.error("Incomplete JSON returned:", raw);
      return { nodes: [], edges: [] };
    }

    return JSON.parse(raw);
  } catch (error) {
    console.error("Gemini Mindmap API Error:", error);
    return { nodes: [], edges: [] };
  }
};
