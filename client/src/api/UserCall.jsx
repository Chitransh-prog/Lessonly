import { supabase } from "../lib/supabase";

export const fetchUserName = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      console.log(session);
      const userMetadata = session.user.user_metadata;

      const name = userMetadata?.full_name || userMetadata?.name || "Educator";
      return name;
    } else {
      console.log("Session not found");
    }
  } catch (error) {
    console.error("Error fetching user name:", error);
  }
};

export const fetchUserAvatar = async () => {
  try {
    // Always use getUser() — fast + reliable
    const { data } = await supabase.auth.getUser();
    const user = data?.user;

    if (!user) return null;

    const avatarPath = user.user_metadata?.avatar_url;

    // No avatar stored
    if (!avatarPath) {
      console.log("No avatar found in metadata");
      return null;
    }

    // If avatar URL is already a public URL → return it
    if (avatarPath.startsWith("http")) {
      return avatarPath;
    }

    // If avatar is stored inside Supabase Storage (private bucket)
    const { data: signed, error } = await supabase.storage
      .from("avatars")
      .createSignedUrl(avatarPath, 3600); // valid 1 hour

    if (error) {
      console.log("Could not fetch signed avatar:", error);
      return null;
    }

    return signed?.signedUrl || null;
  } catch (error) {
    console.error("Error fetching avatar:", error);
    return null;
  }
};
