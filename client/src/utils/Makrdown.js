export default function markdownToPlain(text) {
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
