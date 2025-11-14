import { OpenRouter } from "@openrouter/sdk";

export const fetchApiResponse_Mindmap = async (text) => {
  const openRouter = new OpenRouter({
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  });

  try {
    const completion = await openRouter.chat.send({
      model: "openai/gpt-4o-mini",
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: `
You are an intelligent mind-map engine.
Your output is ALWAYS a multi-layer hierarchical React Flow mindmap.

VERY IMPORTANT:
- Every node **must** include: "type": "baseNodeFull"
- Mindmap spacing must be wide and clean.
`,
        },

        {
          role: "user",
          content: `
Using the extracted text, generate a *hierarchical* mindmap for React Flow.

You MUST follow these updated rules EXACTLY:

────────────────────────────────
🌳 1. JSON OUTPUT FORMAT (STRICT)
────────────────────────────────
{
  "nodes": [
    {
      "id": "node-1",
      "type": "baseNodeFull",
      "data": { 
        "label": "string", 
        "detail?": "string" 
      },
      "position": { "x": number, "y": number }
    }
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "node-1",
      "target": "node-2"
    }
  ]
}

NO MARKDOWN. NO BACKTICKS. ONLY PURE JSON.

────────────────────────────────
📍 2. POSITIONING RULES (IMPROVED SPACING)
────────────────────────────────
- Vertical spacing = depth * **220**   (more room!)
- Horizontal spacing = index * **300** (more spread!)
- Root node = { x: 0, y: 0 }

Depth levels:
- Depth 0 = main topic (center)
- Depth 1 = subtopic → y = 220
- Depth 2 = details → y = 440
- Depth 3 = examples → y = 660
- Depth 4 = deep detail → y = 880

────────────────────────────────
📌 3. NODE DATA RULES
────────────────────────────────
- Short text → data.label
- Long text → data.detail
- data.detail MUST be <= 300 characters
- Every node MUST include: "type": "baseNodeFull"

────────────────────────────────
🔗 4. EDGE RULES
────────────────────────────────
- Only parent → child edges
- ID format: "edge-1", "edge-2", "edge-3"

────────────────────────────────
🆔 5. ID RULES
────────────────────────────────
- Nodes: "node-1", "node-2", ...
- Edges: "edge-1", "edge-2", ...

────────────────────────────────
🧠 6. HIERARCHY REQUIREMENT
────────────────────────────────
Find REAL hierarchy:
- Level 0 → main topics
- Level 1 → subtopics
- Level 2 → detailed concepts
- Level 3+ → definitions, examples, explanations

If text is messy, infer logical hierarchy.

────────────────────────────────

Extracted text:
${text}
`,
        },
      ],
      stream: false,
    });

    const output = completion.choices[0].message.content;
    const result = JSON.parse(output);
    const nodes = result.nodes;
    const edges = result.edges;
    console.log(result);
    console.log(nodes);
    console.log(edges);

    return { nodes, edges };
  } catch (error) {
    console.error("Error while fetching Api response : ", error);
  }
};
