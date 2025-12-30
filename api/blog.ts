import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST allowed" });
    return;
  }

  const { action, payload } = req.body;

  try {

    switch (action) {

      case "generateDraft": {
        const { topic } = payload;
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `你是一位专业的博客作家...${topic}`,
          config: { temperature: 0.7 }
        });
        res.json({ text: response.text });
        return;
      }

      case "polishContent": {
        const { content } = payload;
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `你是一位文学编辑...${content}`,
          config: { temperature: 0.5 }
        });
        res.json({ text: response.text });
        return;
      }

      case "generateTags": {
        const { content } = payload;
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `请提取5个标签：${content}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        });

        res.json({ tags: JSON.parse(response.text || "[]") });
        return;
      }

      default:
        res.status(400).json({ error: "Unknown action" });
    }

  } catch (e: any) {
    console.error(e);
    res.status(500).json({ error: e?.message ?? "server error" });
  }
}
