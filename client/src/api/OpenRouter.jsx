import { OpenRouter } from "@openrouter/sdk";

export const fetchApiResponse = async (text) => {
  try {
    const openRouter = new OpenRouter({
      apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    });

    const completion = await openRouter.chat.send({
      model: "openai/gpt-4o-mini",
      max_tokens: 1000,
      messages: [
        {
          role: "system",
          content: "Extract concepts and generate a JSON mindmap.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      stream: false,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error while fetching Api response : ", error);
  }
};
