import {
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { toPng } from "html-to-image";

export default function ExportButton() {
  const { getNodes } = useReactFlow();

  const handleExport = async () => {
    // 1. Select the viewport that contains your nodes and edges
    const viewportElem = document.querySelector(".react-flow__viewport");

    if (!viewportElem) {
      return;
    }

    // 2. Calculate the total size of the graph (including off-screen nodes)
    const nodesBounds = getNodesBounds(getNodes());
    const imageWidth = nodesBounds.width;
    const imageHeight = nodesBounds.height;

    const transform = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5, // min zoom
      2 // max zoom
    );

    // --- START FIX 1: FORCE EDGE VISIBILITY ---
    // We manually select all edge paths in the DOM and force them to be black/visible.
    // This helps if the export library is ignoring CSS classes or opacity settings.
    const edges = document.querySelectorAll(".react-flow__edge-path");

    // Store original styles (optional, if you want to revert them later)
    // For now, we just overwrite them to ensure they show up in the image.
    edges.forEach((edge) => {
      edge.style.stroke = "#000000"; // Force color to black
      edge.style.strokeWidth = "2px"; // Force thickness
      edge.style.opacity = "1"; // Force full opacity
    });

    // Add a small delay to ensure the browser paints these changes before we screenshot
    await new Promise((resolve) => setTimeout(resolve, 100));
    // --- END FIX 1 ---

    try {
      const img = await toPng(viewportElem, {
        backgroundColor: "#ffffff",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth,
          height: imageHeight,
          // Shift the "camera" to look at the whole graph
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
      });

      const link = document.createElement("a");
      link.download = "mindmap.png";
      link.href = img;
      link.click();
    } catch (e) {
      console.error("Export error:", e);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="px-6 py-3 rounded-lg font-semibold text-white bg-black hover:bg-gray-800 transition-colors"
    >
      Download PNG
    </button>
  );
}
