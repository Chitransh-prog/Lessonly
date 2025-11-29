import {
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { supabase } from "../lib/supabase";
import * as HtmlToImage from "html-to-image";

export default function useThumbnail() {
  const { getNodes } = useReactFlow();

  const generateThumbnail = async () => {
    try {
      const rf = document.querySelector(".react-flow__viewport");
      if (!rf) return null;

      const nodes = getNodes();
      if (nodes.length === 0) return null;

      const bounds = getNodesBounds(nodes);
      const width = bounds.width;
      const height = bounds.height;
      const transform = getViewportForBounds(bounds, width, height, 0.5, 2);

      // 3. Generate PNG
      const MAX_THUMB_SIZE = 400;

      const aspect = width / height;
      let finalWidth = aspect >= 1 ? MAX_THUMB_SIZE : MAX_THUMB_SIZE * aspect;
      let finalHeight = aspect >= 1 ? MAX_THUMB_SIZE / aspect : MAX_THUMB_SIZE;

      const scaleFactor = finalWidth / width;

      const blob = await HtmlToImage.toJpeg(rf, {
        quality: 0.3,
        backgroundColor: "#ffffff",
        width: finalWidth,
        height: finalHeight,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `
      translate(${transform.x}px, ${transform.y}px)
      scale(${transform.zoom * scaleFactor})
    `,
        },
      });

      // ---- IMPORTANT FIX ----
      // Use path only, not full URL
      const fileName = `thumb_${Date.now()}.png`;

      // Upload to PRIVATE bucket
      const { data, error } = await supabase.storage
        .from("Lessonly")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload failed:", error);
        return null;
      }

      console.log("Thumbnail uploaded:", data.path);

      // ⭐ RETURN ONLY THE FILE PATH (safe for private buckets)
      return data.path;
    } catch (err) {
      console.error("Thumbnail generation failed:", err);
      return null;
    }
  };

  return { generateThumbnail };
}
