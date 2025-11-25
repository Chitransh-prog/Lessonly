import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req) => {
  if (req.method === "GET") {
    return new Response(JSON.stringify({ message: "Hello from GET!" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name } = await req.json();
  return new Response(JSON.stringify({ message: `Hello ${name}!` }), {
    headers: { "Content-Type": "application/json" },
  });
});
