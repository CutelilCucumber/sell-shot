const OpenAI = require("openai");
const { prompt, reasoningPrompt } = require("./prompt.js");

const client = new OpenAI({
  apiKey: process.env.OPENCODE_API_KEY,
  baseURL: "https://opencode.ai/zen/v1",
});

const MODELS = ["mimo-v2.5-free", "nemotron-3-lightning-free"];

function isRateLimitError(err) {
  return err.status === 429 || 
         err.code === 'rate_limit_exceeded' || 
         err.code === 'insufficient_quota' ||
         (err.message && err.message.includes('rate limit'));
}

async function identifyItem(imageUrls, useReasoning = true) {
  for (let i = 0; i < MODELS.length; i++) {
    const model = MODELS[i];
    try {
      const response = await client.chat.completions.create({
        model,
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
    } catch (err) {
      const rateLimited = isRateLimitError(err);
      if (rateLimited && i < MODELS.length - 1) {
        console.log(`Rate limit hit on ${model}, falling back to ${MODELS[i + 1]}`);
        continue;
      }
      throw err;
    }
  }
}

module.exports = { identifyItem };