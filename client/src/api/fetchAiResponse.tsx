export async function generateMindmapFromPdf(extractedText: string) {
  try {
    const response = await fetch(
      "http://localhost:54321/functions/v1/create-mindmap",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: extractedText }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Unknown error");
    }

    return await response.json(); // nodes + edges
  } catch (error) {
    console.error("Mindmap creation failed:", error);
    throw error;
  }
}
