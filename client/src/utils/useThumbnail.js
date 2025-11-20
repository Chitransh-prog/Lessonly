import {
  useReactFlow,
  getNodesBounds,
  getViewportForBounds,
} from "@xyflow/react";
import { supabase } from "../lib/supabase";
import { SaveThumbnail } from "@/api/SaveToDB";
import * as HtmlToImage from "html-to-image";

export default function useThumbnail() {
  // 'toPng' is not part of useReactFlow hooks, so we remove it from destructuring
  const { getNodes } = useReactFlow();

  const generateThumbnail = async () => {
    try {
      // Select the viewport div
      const rf = document.querySelector(".react-flow__viewport");

      // Safety check: Make sure the element exists
      if (!rf) {
        console.error("React Flow viewport not found in DOM");
        return;
      }

      // Calculate the bounds of all nodes to ensure we capture the whole map
      const nodes = getNodes();
      if (nodes.length === 0) return; // Don't screenshot empty flows

      const bounds = getNodesBounds(nodes);
      const width = bounds.width;
      const height = bounds.height;

      // Calculate the transform to fit the nodes into the image
      const transform = getViewportForBounds(bounds, width, height, 0.5, 2);

      // 1️⃣ Generate a PNG of the flow
      // FIX: Pass 'rf' (the DOM node) as the first argument
      const pngData = await HtmlToImage.toPng(rf, {
        backgroundColor: "#ffffff",
        width: width, // Set output width to match content
        height: height, // Set output height to match content
        style: {
          // Explicitly transform the view to fit all nodes
          width: `${width}px`,
          height: `${height}px`,
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
        },
        // These are not standard html-to-image options, but kept if you have custom logic
        // usually html-to-image captures what is in the DOM node.
      });

      // 2️⃣ Convert to Blob
      const blob = await (await fetch(pngData)).blob();
      const fileName = `thumb_${Date.now()}.png`;

      // 3️⃣ Upload to Supabase
      const { data, error } = await supabase.storage
        .from("Lessonly")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload failed:", error);
        return;
      }

      // 4️⃣ Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("Lessonly")
        .getPublicUrl(fileName);

      const url = publicUrlData.publicUrl;

      // 5️⃣ Save URL in DB
      await SaveThumbnail(url);

      console.log("Thumbnail saved:", url);

      return url;
    } catch (err) {
      console.error("Thumbnail generation failed:", err);
    }
  };

  return { generateThumbnail };
}
