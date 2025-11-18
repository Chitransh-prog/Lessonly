export default function GetNodesAndEdges(outline) {
  const root = parseOutline(outline);
  return buildMindmapTree(root);
}

/* ---------------------------------------------
   PARSER (Same as before)
---------------------------------------------- */
function parseOutline(outline) {
  if (!outline || typeof outline !== "string") {
    return { label: "Invalid Input", detail: "", children: [] };
  }

  const lines = outline
    .split("\n")
    .map((l) => (l ? l.replace(/\t/g, "  ") : ""))
    .filter((l) => l.trim().length);

  const getDepth = (line) => {
    const match = line.match(/^( *)-/);
    return match ? match[1].length / 2 : 0;
  };

  const clean = (line) => line.replace(/^( *)-/, "").trim();

  const extractLabel = (line) => {
    const cleaned = clean(line);
    return cleaned.includes(":") ? cleaned.split(":")[0].trim() : cleaned;
  };

  const extractDetail = (line) => {
    const cleaned = clean(line);
    return cleaned.includes(":")
      ? cleaned.split(":").slice(1).join(":").trim()
      : "No detail provided.";
  };

  const root = {
    label: extractLabel(lines[0]),
    detail: extractDetail(lines[0]),
    children: [],
  };

  const stack = [root];

  for (let i = 1; i < lines.length; i++) {
    const depth = getDepth(lines[i]);
    const node = {
      label: extractLabel(lines[i]),
      detail: extractDetail(lines[i]),
      children: [],
    };

    while (stack.length > depth + 1) stack.pop();
    stack[stack.length - 1].children.push(node);
    stack.push(node);
  }

  return root;
}

/* ---------------------------------------------
   ADVANCED AUTO-LAYOUT (WITH NODES LIMIT)
---------------------------------------------- */

function buildMindmapTree(root) {
  const nodes = [];
  const edges = [];

  // --- CONFIGURATION ---
  const MAX_NODES = 20; // <--- CHANGE THIS NUMBER TO SET YOUR LIMIT
  const BASE_X_SPACING = 340;
  const BASE_Y_SPACING = 260;

  // Helper: Calculate size only for nodes we are actually going to render
  // This prevents the layout from calculating space for nodes we cut off.
  function getSubtreeSize(node, currentCount) {
    if (currentCount >= MAX_NODES) return 0;
    if (!node.children || node.children.length === 0) return 1;

    let size = 0;
    let localCount = currentCount + 1; // +1 for self

    for (const child of node.children) {
      const childSize = getSubtreeSize(child, localCount);
      size += childSize;
      // Estimate how many nodes that child took up (heuristic)
      // This isn't perfect but good enough for layout spacing
      if (childSize > 0) localCount += childSize;
    }
    return size === 0 ? 1 : size;
  }

  function traverse(node, depth = 0, xOffset = 0, parentId = null) {
    // 1. STOP if we reached the limit
    if (nodes.length >= MAX_NODES) return;

    const id = `node_${nodes.length}`;

    // 2. Calculate subtree size based on remaining allowance
    const subtreeSize = getSubtreeSize(node, nodes.length);
    const positionX = xOffset;

    nodes.push({
      id,
      type: "baseNodeFull",
      data: {
        label: node.label,
        detail: node.detail,
      },
      position: { x: positionX, y: depth * BASE_Y_SPACING },
    });

    if (parentId) {
      edges.push({
        id: `edge_${edges.length}`,
        source: parentId,
        target: id,
      });
    }

    let accumulatedShift = xOffset - ((subtreeSize - 1) * BASE_X_SPACING) / 2;

    if (node.children) {
      node.children.forEach((child) => {
        // Check limit before processing child
        if (nodes.length >= MAX_NODES) return;

        const childSize = getSubtreeSize(child, nodes.length);
        const childCenter =
          accumulatedShift + ((childSize - 1) * BASE_X_SPACING) / 2;

        traverse(child, depth + 1, childCenter, id);

        accumulatedShift += childSize * BASE_X_SPACING;
      });
    }
  }

  traverse(root, 0, 0, null);
  return { nodes, edges };
}
