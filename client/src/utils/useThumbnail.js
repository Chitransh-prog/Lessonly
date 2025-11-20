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
      // 1. Select the viewport
      const rf = document.querySelector(".react-flow__viewport");
      if (!rf) return null;

      // 2. Calculate bounds to fit everything
      const nodes = getNodes();
      if (nodes.length === 0) return null;

      const bounds = getNodesBounds(nodes);
      const width = bounds.width;
      const height = bounds.height;
      const transform = getViewportForBounds(bounds, width, height, 0.5, 2);

      // 3. Generate PNG
      const pngData = await HtmlToImage.toPng(rf, {
        backgroundColor: "#ffffff",
        width: width,
        height: height,
        style: {
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
      });

      // 4. Convert to Blob
      const blob = await (await fetch(pngData)).blob();
      const fileName = `thumb_${Date.now()}.png`;

      // 5. Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("Lessonly") // Ensure this matches your bucket name
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload failed:", error);
        return null;
      }

      // 6. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from("Lessonly")
        .getPublicUrl(fileName);

      // Return the URL directly (do not save to DB here)
      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Thumbnail generation failed:", err);
      return null;
    }
  };

  return { generateThumbnail };
}
