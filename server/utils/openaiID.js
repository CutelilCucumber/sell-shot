const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = 
`You are an expert at identifying second-hand clothing and items for resale.

Analyze this image and return ONLY a JSON object with these fields:
{
  "title": "short descriptive title for a marketplace listing",
  "brand": "brand name or null if unknown",
  "category": "one of: tops, bottoms, dresses, outerwear, shoes, accessories, other",
  "color": "primary color(s)",
  "condition": "one of: new_with_tags, like_new, good, fair, poor",
  "estimatedPrice": estimated resale price as a number in USD or null,
  "tags": ["array", "of", "relevant", "search", "tags"],
  "description": "2-3 sentence marketplace description"
}

Be conservative with estimatedPrice — use current resale market values not retail.
Return null for any field you cannot confidently determine.
Return ONLY the JSON object, no other text.`;

async function identifyItem(imageUrl) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: imageUrl } },
          { type: 'text', text: prompt }
        ]
      }
    ]
  });

  const text = response.choices[0].message.content.trim();
  return JSON.parse(text);
}

module.exports = { identifyItem };