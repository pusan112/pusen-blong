// api/ai.ts
import { GoogleGenAI, Type } from "@google/genai";

// 只在后端读取环境变量（确保已在 Vercel / .env.local 中配置 GEMINI_API_KEY）
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Only POST method allowed" });
    return;
  }

  try {
    const { action, payload } = req.body || {};

    if (!action) {
      res.status(400).json({ error: "Missing action" });
      return;
    }

    switch (action) {
      case "generateDraft": {
        const { topic } = payload as { topic: string };

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `你是一位专业的博客作家。请围绕以下主题撰写一篇深度、富有启发性的文章：${topic}。
                     要求：1. 包含引人注目的标题；2. 结构清晰，包含小标题；3. 语言优雅且具有感染力；4. 约800字。`,
          config: {
            temperature: 0.7,
          },
        });

        res.status(200).json({
          text: response.text || "未能生成内容，请稍后再试。",
        });
        return;
      }

      case "generateTags": {
        const { content } = payload as { content: string };

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `请根据以下文章内容，提取5个最合适的标签（每个标签2-4个字）：\n\n${content}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
        });

        let tags: string[] = [];
        try {
          tags = JSON.parse(response.text || "[]");
        } catch {
          tags = ["写作", "思绪"];
        }

        res.status(200).json({ tags });
        return;
      }

      case "summarize": {
        const { content } = payload as { content: string };

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `请为以下博文内容提供一个简短精炼的摘要（100字以内）：\n\n${content}`,
          config: {
            temperature: 0.3,
          },
        });

        res.status(200).json({
          text: response.text || "摘要生成失败。",
        });
        return;
      }

      case "findConnections": {
        const { currentPost, otherPosts } = payload as {
          currentPost: { title: string; content: string };
          otherPosts: { id: string; title: string; excerpt: string }[];
        };

        const postsData = otherPosts
          .map(
            (p) =>
              `ID: ${p.id}, Title: ${p.title}, Excerpt: ${p.excerpt}`,
          )
          .join("\n");

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `作为花园园丁，请分析当前文章与花园中其他文章的潜在联系。
                     当前文章标题: ${currentPost.title}
                     当前文章内容摘要: ${currentPost.content.substring(0, 300)}...
                     
                     可选文章列表:
                     ${postsData}
                     
                     请找出最相关的2-3篇文章，并说明关联理由。请以JSON数组格式返回，包含id和reason字段。`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["id", "reason"],
              },
            },
          },
        });

        let connections: { id: string; reason: string }[] = [];
        try {
          connections = JSON.parse(response.text || "[]");
        } catch {
          connections = [];
        }

        res.status(200).json({ connections });
        return;
      }

      default:
        res.status(400).json({ error: `Unknown action: ${action}` });
        return;
    }
  } catch (err: any) {
    console.error("AI error:", err);
    res
      .status(500)
      .json({ error: err?.message || "Internal server error" });
  }
}
