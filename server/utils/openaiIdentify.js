const OpenAI = require("openai");
const { prompt, reasoningPrompt } = require("./prompt.js");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function identifyItem(imageUrls, useReasoning = true) {
  const response = await client.responses.create({
    model: "gpt-4o-mini",
    input: [{
      role: "user",
      content: [
        { type: "input_text", text: useReasoning ? reasoningPrompt : prompt },
        ...imageUrls.map(url => ({ type: "input_image", image_url: url }))
      ]
    }]
  });

  const text = response.output_text.trim();
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

module.exports = { identifyItem };