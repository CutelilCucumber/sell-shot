import { Ollama } from 'ollama';
import fetch from 'node-fetch';
const { prompt, reasoningPrompt } = await import('./prompt.js');
//ollama requires the image to be base64 encoded, so we need to fetch it and convert it before sending to the model

async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function identifyItem(imageUrl, useReasoning = true) {
  const ollama = new Ollama();
  const imageBase64 = await fetchImageAsBase64(imageUrl);

  const response = await ollama.chat({
    model: 'minicpm-v4.5:latest',
    messages: [
      {
        role: 'user',
        content: useReasoning ? reasoningPrompt : prompt,
        images: [imageBase64],
      }
    ],
    stream: false,
  });

  const text = response.message.content.trim();

  // strip markdown code fences if model wraps response
  const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

  return JSON.parse(clean);
}

export { identifyItem };