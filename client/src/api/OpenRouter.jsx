import { GoogleGenerativeAI } from "@google/generative-ai";
import { mindmapSchema } from "../utils/MindmapSchema";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenerativeAI(apiKey);

export const fetchApiResponse_Mindmap = async (text) => {
  const systemInstruction = `
You are a Mindmap JSON Generator.

Your ONLY output MUST be a JSON object of the form:
{
  "nodes": [...],
  "edges": [...]
}

STRICT REQUIREMENTS:
- NEVER output an array at the top level.
- ALWAYS output an object containing BOTH "nodes" and "edges".
- The output MUST match the provided JSON schema EXACTLY.
- NO comments, NO prose, NO explanations — ONLY pure JSON.

NODE RULES:
- Max 25 nodes.
- Max depth = 3.
- Max 3 children per node.
- No duplicate nodes.
- If text is long, summarize instead of expanding nodes.
- Each node must include:
  id, type: "baseNodeFull", data:{label,detail?}, position:{x,y}

EDGE RULES:
- Every node except the root MUST have exactly 1 parent.
- edges[i].source = parentNodeId
- edges[i].target = childNodeId
- Edge id must be "edge_<index>"

POSITION RULES:
- y = depth * 220
- x = index * 300
- Root node: (0, 0)
- Depth 1 children: x positions = [-600, -300, 0, 300, 600]
- For deeper levels, children are positioned relative to their parent.

OUTPUT RULES:
- JSON MUST be complete. NO truncation.
- MUST end with a closing "}".
- If output grows too long, shorten labels and detail, but NEVER break JSON.
- DO NOT include undefined fields.
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
Generate a mindmap from the following text.
Return ONLY valid JSON that matches the schema.
Your JSON MUST be wrapped as:

{
  "nodes": [...],
  "edges": [...]
}

TEXT:
${text}
`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 10000,
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
