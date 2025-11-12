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
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      const avatarUrl = session.user.user_metadata.avatar_url;
      console.log("This is the avatar image", avatarUrl);
      if (!avatarUrl) {
        console.log("Avatar url not found");
      }
      return avatarUrl;
    }
  } catch (error) {
    console.error("Error while fetching User Avatar: ", error);
  }
};
