import { supabase } from "../lib/supabase";

const dataURLToBlob = (dataURL) => {
  try {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error("Blob conversion failed", e);
    return null;
  }
};

export async function UploadThumbnail(userId, mindmapName, thumbnailDataUrl) {
  try {
    if (!userId || !mindmapName || !thumbnailDataUrl) {
      throw new Error("Missing userId, mindmapName, or thumbnail data");
    }

    const imageBlob = dataURLToBlob(thumbnailDataUrl);
    if (!imageBlob) throw new Error("Failed to process image data");

    const cleanName = mindmapName.trim().replace(/\s+/g, "_").toLowerCase();
    const fileName = `${userId}/${cleanName}.png`;

    const { data, error } = await supabase.storage
      .from("lessonly") // MUST be lowercase
      .upload(fileName, imageBlob, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) throw error;

    console.log("📁 Thumbnail uploaded to path:", data.path);

    // ⭐ RETURN THE FILE PATH HERE
    return data.path;
  } catch (error) {
    console.error("Error while uploading thumbnail: ", error);
    return null;
  }
}
