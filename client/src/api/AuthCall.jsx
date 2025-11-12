import { supabase } from "../lib/supabase";

export const fetchCheckAuth = async () => {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Supabase session error:", error);
    return;
  }
  return session;
};
