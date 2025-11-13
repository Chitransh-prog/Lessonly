import { supabase } from "../lib/supabase";

export async function addNewsletterEmail(email) {
  const { data, error } = await supabase
    .from("newsletter")
    .insert({ email });

  return { data, error };
}
