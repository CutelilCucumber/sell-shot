const OpenAI = require("openai");
const { prompt, reasoningPrompt } = require("./prompt.js");

const client = new OpenAI({
  apiKey: process.env.OPENCODE_API_KEY,
  baseURL: "https://opencode.ai/zen/v1",
});

async function identifyItem(imageUrls, useReasoning = true) {
  const response = await client.chat.completions.create({
    model: "mimo-v2.5-free",
    messages: [{
      role: "user",
      content: [
        { type: "text", text: useReasoning ? reasoningPrompt : prompt },
        ...imageUrls.map(url => ({ type: "image_url", image_url: { url } }))
      ]
    }],
    stream: false,
  });

  const text = response.choices[0].message.content.trim();
  const clean = text.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(clean);
}

module.exports = { identifyItem };