export async function SaveThumbnail(thumbnail_url) {
  try {
    await supabase.from("mindmap_history").insert({
      user_id: currentUserId,
      thumbnail_url: thumbnailUrl,
      created_at: new Date(),
    });
  } catch (error) {
    console.log("Error while saving thumbnail: ", error);
  }
}
