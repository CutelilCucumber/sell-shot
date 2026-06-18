import { Ollama } from 'ollama';
import fetch from 'node-fetch';

const prompt = 
`You are an expert at identifying second-hand clothing and items for resale.

Analyze this image and return ONLY a JSON object. Each field must be an object containing the "value", a "confidence_score" (0.0 to 1.0), and a brief "reasoning"_string (a few words describing what you see).

If a value cannot be determined, set the "value" to null and "confidence_score" to 0.0.

Constraints:
- brand: Use the brand name or null if not visible/identifiable.
- category: Must be one of: [tops, bottoms, dresses, outerwear, shoes, accessories, other]
- condition: Must be one of: [new_with_tags, like_new, good, fair, poor]
- estimatedPrice: Provide a number (integer) representing current resale market value in USD. Do not use original retail prices.
- tags: An array of 3-5 relevant search keywords.

JSON Structure:
{
  "title": {"value": "string", "confidence_score": float, "reasoning": "string"},
  "brand": {"value": "string or null", "confidence_score": float, "reasoning": "string"},
  "category": {"value": "selected_option", "confidence_score": float, "reasoning": "string"},
  "color": {"value": "primary color(s)", "confidence_score": float, "reasoning": "string"},
  "material": {"value": "e.g., cotton, leather or null", "confidence_score": float, "reasoning": "string"},
  "condition": {"value": "selected_option", "confidence_score": float, "reasoning": "string"},
  "estimatedPrice": {"value": number_or_null, "confidence_score": float, "reasoning": "string"},
  "tags": {"value": ["tag1", "tag2"], "confidence_score": float, "reasoning": "string"},
  "description": {"value": "2-3 sentence marketplace description", "confidence_score": float, "reasoning": "string"}
}

Return ONLY the JSON object. No conversational filler.
`;

//ollama requires the image to be base64 encoded, so we need to fetch it and convert it before sending to the model
async function fetchImageAsBase64(url) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

async function identifyItem(imageUrl) {
  const ollama = new Ollama();
  const imageBase64 = await fetchImageAsBase64(imageUrl);

  const response = await ollama.chat({
    model: 'minicpm-v4.5:latest',
    messages: [
      {
        role: 'user',
        content: prompt,
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