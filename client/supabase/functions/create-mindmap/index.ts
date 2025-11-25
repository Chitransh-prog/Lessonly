// supabase/functions/create-mindmap/index.ts

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "npm:@google/generative-ai";

interface OutlineNode {
  label: string;
  detail: string;
  children: OutlineNode[];
}

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

console.log("Gemini key: ", GEMINI_API_KEY);

if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY");
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function parseOutline(outline: string): OutlineNode {
  if (!outline || typeof outline !== "string") {
    return { label: "Invalid Input", detail: "", children: [] };
  }

  const lines = outline
    .split("\n")
    .map((l) => l.replace(/\t/g, "  "))
    .filter((l) => l.trim().length)
    .filter((l) => /^[-a-zA-Z0-9]/.test(l.trim()));

  const getDepth = (line: string) =>
    (line.match(/^( *)-/)?.[1].length ?? 0) / 2;

  const clean = (line: string) => line.replace(/^( *)-/, "").trim();

  const extractLabel = (line: string) => {
    const c = clean(line);
    return c.includes(":") ? c.split(":")[0].trim() : c;
  };

  const extractDetail = (line: string) => {
    const c = clean(line);
    return c.includes(":")
      ? c.split(":").slice(1).join(":").trim()
      : "No detail provided.";
  };

  const root: OutlineNode = {
    label: extractLabel(lines[0]),
    detail: extractDetail(lines[0]),
    children: [],
  };

  const stack = [root];

  for (let i = 1; i < lines.length; i++) {
    const depth = getDepth(lines[i]);

    const node: OutlineNode = {
      label: extractLabel(lines[i]),
      detail: extractDetail(lines[i]),
      children: [],
    };

    while (stack.length > depth + 1) stack.pop();

    stack.at(-1)!.children.push(node);
    stack.push(node);
  }

  return root;
}

// ---------------------------------------------------------------------
// MINDMAP BUILDER
// ---------------------------------------------------------------------

function buildMindmapTree(root: OutlineNode) {
  const nodes: any[] = [];
  const edges: any[] = [];

  const MAX_NODES = 20;
  const BASE_X_SPACING = 340;
  const BASE_Y_SPACING = 260;

  function getSubtreeSize(node: OutlineNode, currentCount: number): number {
    if (currentCount >= MAX_NODES) return 0;
    if (!node.children.length) return 1;

    let size = 0;
    let local = currentCount + 1;

    for (const child of node.children) {
      const childSize = getSubtreeSize(child, local);
      size += childSize;
      if (childSize > 0) local += childSize;
    }

    return size || 1;
  }

  function traverse(
    node: OutlineNode,
    depth = 0,
    xOffset = 0,
    parentId: string | null = null
  ) {
    if (nodes.length >= MAX_NODES) return;

    const id = `node_${nodes.length}`;
    const subtreeSize = getSubtreeSize(node, nodes.length);

    nodes.push({
      id,
      type: "baseNodeFull",
      data: { label: node.label, detail: node.detail },
      position: { x: xOffset, y: depth * BASE_Y_SPACING },
    });

    if (parentId) {
      edges.push({
        id: `edge_${edges.length}`,
        source: parentId,
        target: id,
      });
    }

    let shift = xOffset - ((subtreeSize - 1) * BASE_X_SPACING) / 2;

    for (const child of node.children) {
      const size = getSubtreeSize(child, nodes.length);
      const center = shift + ((size - 1) * BASE_X_SPACING) / 2;

      traverse(child, depth + 1, center, id);
      shift += size * BASE_X_SPACING;
    }
  }

  traverse(root);
  return { nodes, edges };
}

const GetNodesAndEdges = (outline: string) =>
  buildMindmapTree(parseOutline(outline));

// ---------------------------------------------------------------------
// MAIN EDGE FUNCTION (Frontend sends plain text)
// ---------------------------------------------------------------------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const inputText = body.text || "";

    if (!inputText.trim()) {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const systemInstruction = `
You are an educational synthesizer. 
Your goal is to create a mindmap that is visually simple (few nodes) but intellectually satisfying (rich details).
`;

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
${inputText}
`;

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

    const result = await model.generateContent({
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

    const outline = result.response
      .text()
      .replace(/^```[\s\S]*?```/gm, "")
      .trim();

    const mindmapData = GetNodesAndEdges(outline);

    return new Response(JSON.stringify(mindmapData), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("❌ Server Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
