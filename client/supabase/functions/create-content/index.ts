// supabase/functions/generate-educational-content/index.ts

//------------------------------------------------------
// Imports
//------------------------------------------------------
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

//------------------------------------------------------
// Env
//------------------------------------------------------
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY");
}

const ai = new GoogleGenerativeAI(GEMINI_API_KEY!);

//------------------------------------------------------
// CORS
//------------------------------------------------------
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

//------------------------------------------------------
// Utility: JSON response
//------------------------------------------------------
function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function markdownToPlain(text: String) {
  return (
    text
      // Remove headings #######
      .replace(/^#{1,6}\s*/gm, "")
      // Remove bold/italic **text**, *text*, __text__, _text_
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      // Remove > blockquotes
      .replace(/^>\s*/gm, "")
      // Remove bullet points - and *
      .replace(/^\s*[-*+]\s+/gm, "")
      // Remove numbered list prefixes "1. text"
      .replace(/^\s*\d+\.\s+/gm, "")
      // Remove inline code `code`
      .replace(/`([^`]+)`/g, "$1")
      // Remove code fences ``` ```
      .replace(/```[\s\S]*?```/g, "")
      // Remove horizontal rules ---
      .replace(/^-{3,}$/gm, "")
      // Remove markdown links [text](url)
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      // Remove bare [text]
      .replace(/\[([^\]]+)\]/g, "$1")
      // Remove emphasis ~~
      .replace(/~~(.*?)~~/g, "$1")
      // Remove images ![alt](url)
      .replace(/!\[.*?\]\(.*?\)/g, "")
      // Collapse multiple newlines
      .replace(/\n{2,}/g, "\n")
      .trim()
  );
}

//------------------------------------------------------
// MAIN EDGE FUNCTION
//------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200, // <-- REQUIRED
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const body = await req.json();

    const { topic,syllabus, summary, type, grade, tone, language } = body;

    //------------------------------------------------------
    // Validate user input
    //------------------------------------------------------
    if (!topic || !type) {
      return json(
        { error: "Missing required fields: 'topic' and 'type'" },
        400
      );
    }

    //------------------------------------------------------
    // PROMPT — Clean Markdown Output
    //------------------------------------------------------
const prompt = `
You are an educational content generator.  
Produce **clean, well-structured Markdown** that is easy to read and suitable for PDF export.

---

## Input Details

- **Topic:** ${topic}
- **Syllabus:** ${syllabus}
- **Summary:** ${summary || "None"}
- **Type:** ${type}
- **Grade Level:** ${grade}
- **Tone:** ${tone}
- **Language:** ${language}

---

## Markdown Rules (Important)
- Use proper Markdown:
  - # Title
  - ## Section Headings
  - ### Subheadings
  - Paragraphs with spacing
  - Bullet lists (- …)
  - Numbered lists (1. …)
  - Code blocks (when relevant)
  - Tables (only when useful)
- Add a blank line between all sections and paragraphs.
- Do **not** create long wall-of-text paragraphs.
- Write only Markdown. No HTML, no explanations.

---

## Required Structure
Follow this layout unless the content type requires a different one:

# Title (Topic)
## Overview
Short introduction connecting the topic + syllabus.

## Key Points from the Syllabus
Bullet list of the important items.

## Main Content
Well-structured explanation using sections and subheadings.

## Examples
Clear, simple examples. Code blocks if needed.

## Summary
Short recap of the key ideas.

## Quiz (Optional)
5 short MCQs + answers below them.

---

Return the final answer **only in Markdown**.
`;


    //------------------------------------------------------
    // Gemini Model
    //------------------------------------------------------
    const model = ai.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    //------------------------------------------------------
    // Generate content
    //------------------------------------------------------
    const result = await model.generateContent(prompt);
    const markdown = result.response.text();
    const response = markdownToPlain(markdown);

    //------------------------------------------------------
    // Respond with Markdown
    //------------------------------------------------------
    return json({ response });
  } catch (err: any) {
    console.error("❌ Error:", err);
    return json({ error: err.message || "Server error" }, 500);
  }
});
