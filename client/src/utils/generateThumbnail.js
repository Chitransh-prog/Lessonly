import {
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { toPng } from "html-to-image";
import { supabase } from "../supabaseClient"; // your client path
import { SaveThumbnail } from "@/api/SaveToDB";

export default function generateThumbnail() {
  const { getNodes } = useReactFlow();

  const handleExport = async () => {
    const viewportElem = document.querySelector(".react-flow__viewport");
    if (!viewportElem) return;

    const nodesBounds = getNodesBounds(getNodes());
    const imageWidth = nodesBounds.width;
    const imageHeight = nodesBounds.height;

    const transform = getViewportForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2
    );

    // Force edges to be visible
    const edges = document.querySelectorAll(".react-flow__edge-path");
    edges.forEach((edge) => {
      edge.style.stroke = "#000";
      edge.style.strokeWidth = "2px";
      edge.style.opacity = "1";
    });

    await new Promise((r) => setTimeout(r, 100));

    try {
      // 🔥 Step 1: Generate PNG (as dataURL)
      const dataUrl = await toPng(viewportElem, {
        backgroundColor: "#ffffff",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth,
          height: imageHeight,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
      });

      // 🔥 Step 2: Convert dataURL → Blob
      const blob = await (await fetch(dataUrl)).blob();

      // 🔥 Step 3: Upload to Supabase
      const fileName = `thumb_${Date.now()}.png`;

      const { data, error } = await supabase.storage
        .from("Lessonly")
        .upload(fileName, blob, {
          upsert: false,
          contentType: "image/png",
        });

      if (error) {
        console.error("Supabase upload error:", error);
        return;
      }

      console.log("Uploaded:", data);

      const thumbnailUrl = publicUrlData.publicUrl;

      console.log("Thumbnail URL:", thumbnailUrl);

      SaveThumbnail(thumbnailUrl);

      console.log("Thumbnail saved!");
    } catch (e) {
      console.error("Thumbnail generation failed:", e);
    }
  };
}
