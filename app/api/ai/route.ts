
import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

// Always use new GoogleGenAI({ apiKey: process.env.API_KEY }); directly
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json();

    if (!process.env.API_KEY) {
      return NextResponse.json({ error: "API Key not configured on server" }, { status: 500 });
    }

    switch (action) {
      case "summarize": {
        const response = await genAI.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `请为以下博文内容提供一个简短精炼的摘要（100字以内）：\n\n${payload.content}`,
          config: { temperature: 0.3 },
        });
        return NextResponse.json({ text: response.text });
      }

      case "generateTags": {
        const response = await genAI.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `请根据以下文章内容，提取5个最合适的标签（每个标签2-4个字）：\n\n${payload.content}`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
        });
        return NextResponse.json({ tags: JSON.parse(response.text || "[]") });
      }

      case "findConnections": {
        const postsData = payload.otherPosts.map((p: any) => `ID: ${p.id}, Title: ${p.title}, Excerpt: ${p.excerpt}`).join('\n');
        const response = await genAI.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `作为花园园丁，请分析当前文章与花园中其他文章的潜在联系。
                     当前文章标题: ${payload.currentPost.title}
                     当前文章摘要: ${payload.currentPost.content.substring(0, 300)}...
                     
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
                  reason: { type: Type.STRING }
                },
                required: ["id", "reason"]
              }
            }
          },
        });
        return NextResponse.json({ connections: JSON.parse(response.text || "[]") });
      }

      case "generateDraft": {
        const response = await genAI.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `你是一位专业的博客作家。请围绕以下主题撰写一篇深度、富有启发性的文章：${payload.topic}。
                     要求：1. 包含引人注目的标题；2. 结构清晰，包含小标题；3. 语言优雅且具有感染力；4. 约800字。`,
          config: { temperature: 0.7 },
        });
        return NextResponse.json({ text: response.text });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
