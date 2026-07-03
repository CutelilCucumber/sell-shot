const { Ollama } = require('ollama');
const { prompt, reasoningPrompt } = require('./prompt.js');

//ollama requires the images to be base64 encoded, so we need to fetch it and convert it before sending to the model

async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function identifyItem(imageUrls, useReasoning = true) {
  const ollama = new Ollama();
  const imageBase64Array = await Promise.all(
    imageUrls.map(url => fetchImageAsBase64(url))
  );

  const response = await ollama.chat({
    model: 'minicpm-v4.5:latest',
    messages: [
      {
        role: 'user',
        content: useReasoning ? reasoningPrompt : prompt,
        images: imageBase64Array,
      }
    ],
    stream: false,
  });

  const text = response.message.content.trim();

  // strip markdown code fences if model wraps response
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  return JSON.parse(clean);
}

module.exports = { identifyItem };