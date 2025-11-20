import { supabase } from "./supabase";

export async function checkUsageLimit(userId, MAX_REQUESTS = 200) {
  const month = new Date().toISOString().slice(0, 7); // "2025-11"

  // 1. Check record for this user + month
  let { data, error } = await supabase
    .from("create_usage_limit")
    .select("*")
    .eq("user_id", userId)
    .eq("month", month)
    .single();

  // 2. If entry does not exist → create it
  if (!data) {
    const { data: newEntry, error: insertErr } = await supabase
      .from("create_usage_limit")
      .insert({
        user_id: userId,
        month,
        request_count: 0,
      })
      .select()
      .single();

    if (insertErr) {
      console.error("❌ Error creating usage row:", insertErr);
      return false;
    }

    data = newEntry;
  }

  // 3. Check if user exceeded the limit
  if (data.request_count >= MAX_REQUESTS) {
    return false; // ❌ over the limit
  }

  // 4. Increment usage
  const { error: updateErr } = await supabase
    .from("create_usage_limit")
    .update({
      request_count: data.request_count + 1,
      updated_at: new Date(),
    })
    .eq("user_id", userId)
    .eq("month", month);

  if (updateErr) {
    console.error("❌ Error updating usage count:", updateErr);
  }

  return true;
}
