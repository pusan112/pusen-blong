// api/gemini.ts
import { GoogleGenAI } from "@google/genai";

// 从环境变量读取 GEMINI_API_KEY（在 Vercel / 本地 .env 里配置）
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export default async function handler(req: any, res: any) {
  // 只接受 POST
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  try {
    const { prompt } = req.body as { prompt?: string };

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ error: "prompt is required" });
      return;
    }

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash", // 这里按你实际想用的模型改
      contents: prompt,
    });

    // 不同版本 SDK 返回可能略有不同，这里做个兼容处理
    const text =
      (result as any).text ??
      (result as any).response?.candidates?.[0]?.content?.parts
        ?.map((p: any) => p.text ?? "")
        .join("") ??
      "";

    res.status(200).json({ text });
  } catch (err: any) {
    console.error("Gemini API error:", err);
    res.status(500).json({
      error: "Gemini API error",
      detail: err?.message ?? String(err),
    });
  }
}
