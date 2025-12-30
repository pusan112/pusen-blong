// api/gemini.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

// GEMINI_API_KEY 会从环境变量里读取（Vercel / 本地 .env）
const ai = new GoogleGenAI({}); // 官方 SDK 会自动用 GEMINI_API_KEY :contentReference[oaicite:0]{index=0}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只接受 POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { prompt } = req.body as { prompt?: string };

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'prompt is required' });
      return;
    }

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // 根据你实际用的模型改
      contents: prompt,
    });

    // 官方 SDK 支持直接拿 `response.text` :contentReference[oaicite:1]{index=1}
    // @ts-ignore
    const text = (result as any).text ?? '';

    res.status(200).json({ text });
  } catch (err: any) {
    console.error('Gemini API error:', err);
    res.status(500).json({
      error: 'Gemini API error',
      detail: err?.message ?? String(err),
    });
  }
}
