const OpenAI = require("openai");
const { prompt, reasoningPrompt } = require("./prompt.js");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function identifyItem(imageUrl, useReasoning = false) {
  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: useReasoning ? reasoningPrompt : prompt,
          },
          {
            type: "input_image",
            image_url: imageUrl,
          },
        ],
      },
    ],
  });

  const text = response.output_text.trim();

  // Strip markdown fences if they appear
  const clean = text
    .replace(/^```json\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(clean);
}

module.exports = { identifyItem };