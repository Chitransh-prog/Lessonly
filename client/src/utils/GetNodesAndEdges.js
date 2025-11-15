export default function GetNodesAndEdges(outline) {
  const root = parseOutline(outline);
  return buildMindmapTree(root);
}

/* ---------------------------------------------
   PARSER (safe, detailed explanations supported)
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
   ADVANCED AUTO-LAYOUT (NO OVERLAP)
---------------------------------------------- */

function buildMindmapTree(root) {
  const nodes = [];
  const edges = [];

  const BASE_X_SPACING = 340;
  const BASE_Y_SPACING = 260;

  function getSubtreeSize(node) {
    if (!node.children || node.children.length === 0) return 1;
    return node.children.reduce((acc, child) => acc + getSubtreeSize(child), 0);
  }

  function traverse(node, depth = 0, xOffset = 0, parentId = null) {
    const id = `node_${nodes.length}`;

    const subtreeSize = getSubtreeSize(node);
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

    node.children?.forEach((child) => {
      const childSize = getSubtreeSize(child);
      const childCenter =
        accumulatedShift + ((childSize - 1) * BASE_X_SPACING) / 2;

      traverse(child, depth + 1, childCenter, id);

      accumulatedShift += childSize * BASE_X_SPACING;
    });
  }

  traverse(root, 0, 0, null);
  return { nodes, edges };
}
