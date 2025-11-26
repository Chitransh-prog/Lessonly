import { supabase } from "../lib/supabase";

export async function addNewsletterEmail(email) {
  if (!email || typeof email !== "string") {
    return { data: null, error: { message: "Invalid email" } };
  }

  // Prevent duplicates: check if email exists
  const { data: existing, error: checkError } = await supabase
    .from("newsletter")
    .select("email")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return { data: null, error: { message: "Email already subscribed" } };
  }

  // Insert new record
  const { data, error } = await supabase
    .from("newsletter")
    .insert([{ email }]);

  return { data, error };
}
