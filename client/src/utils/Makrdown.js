export default function markdownToPlain(text) {
  if (!text) return "";

  return (
    text
      // 1. Remove images ![alt](url) (MUST BE DONE BEFORE LINKS)
      .replace(/!\[.*?\]\(.*?\)/g, "")
      
      // 2. Remove headings
      .replace(/^#{1,6}\s+/gm, "")
      
      // 3. Remove code fences but KEEP the code text
      // Matches ```language\n code ``` and keeps ' code '
      .replace(/```[\w]*\n?([\s\S]*?)```/g, "$1")
      
      // 4. Remove inline code `code`
      .replace(/`([^`]+)`/g, "$1")
      
      // 5. Remove HTML tags (optional, but good for cleanliness)
      .replace(/<[^>]*>/g, "")
      
      // 6. Remove bold/italic
      .replace(/(\*\*|__)(.*?)\1/g, "$2")
      .replace(/(\*|_)(.*?)\1/g, "$2")
      
      // 7. Remove blockquotes
      .replace(/^>\s+/gm, "")
      
      // 8. Remove list bullets/numbers
      .replace(/^\s*[-*+]\s+/gm, "")
      .replace(/^\s*\d+\.\s+/gm, "")
      
      // 9. Remove links [text](url) -> text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      
      // 10. Remove horizontal rules
      .replace(/^-{3,}$/gm, "")
      
      // 11. Remove strikethrough
      .replace(/~~(.*?)~~/g, "$1")
      
      // 12. Collapse multiple newlines into one and trim
      .replace(/\n{3,}/g, "\n\n") // Keep max 2 newlines for paragraph separation
      .trim()
  );
}