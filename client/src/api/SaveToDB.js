import { supabase } from "../lib/supabase";

// Helper: Convert Base64 Data URL to Blob
const dataURLToBlob = (dataURL) => {
  try {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Blob conversion failed", e);
    return null;
  }
};

/**
 * Uploads the generated thumbnail directly to Supabase Storage (Bucket: Lessonly)
 * Path format: {userId}/{mindmapName}.png
 */
export async function UploadThumbnail(userId, mindmapName, thumbnailDataUrl) {
  try {
    if (!userId || !mindmapName || !thumbnailDataUrl) {
      throw new Error("Missing userId, mindmapName, or thumbnail data");
    }

    const imageBlob = dataURLToBlob(thumbnailDataUrl);
    if (!imageBlob) throw new Error("Failed to process image data");

    // Create clean filename: user_id/mindmap_name.png
    const cleanName = mindmapName.trim().replace(/\s+/g, "_").toLowerCase();
    const fileName = `${userId}/${cleanName}.png`;

    // Upload to "Lessonly" bucket
    const { data, error } = await supabase.storage
      .from("Lessonly")
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        upsert: true, // Overwrite if it already exists
      });

    if (error) throw error;

    console.log("Thumbnail uploaded successfully to:", fileName);
    return data;
  } catch (error) {
    console.error("Error while uploading thumbnail: ", error);
    return null;
  }
}
