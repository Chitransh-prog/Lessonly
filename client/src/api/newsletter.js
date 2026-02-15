import { supabase } from "../lib/supabase";

export async function addNewsletterEmail(email) {
  // 1. Better Validation using Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return { data: null, error: { message: "Invalid email address" } };
  }

  try {
    // 2. Single Step: Insert & Select
    // We rely on the database 'unique' constraint on the email column.
    const { data, error } = await supabase
      .from("newsletter")
      .insert([{ email }])
      .select() // <--- CRITICAL: Required to return the inserted data object
      .single();

    if (error) {
      // 3. Handle Duplicate Error (Postgres Code 23505)
      if (error.code === '23505') {
        return { data: null, error: { message: "This email is already subscribed." } };
      }
      // Return other errors as is
      return { data: null, error };
    }

    return { data, error: null };

  } catch (err) {
    console.error("Newsletter API Error:", err);
    return { data: null, error: { message: "Unexpected error occurred." } };
  }
}