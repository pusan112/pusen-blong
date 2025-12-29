
import { GoogleGenAI, Type } from "@google/genai";

// Initialize AI client
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const blogService = {
  /**
   * Generates a blog post draft based on a topic
   */
  async generateDraft(topic: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位专业的博客作家。请围绕以下主题撰写一篇深度、富有启发性的文章：${topic}。
                 要求：1. 包含引人注目的标题；2. 结构清晰，包含小标题；3. 语言优雅且具有感染力；4. 约800字。`,
      config: {
        temperature: 0.7,
      },
    });
    return response.text || "未能生成内容，请稍后再试。";
  },

  /**
   * Refines and polishes existing text
   */
  async polishContent(content: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一位文学编辑。请对以下文字进行润色，使其表达更优雅、更具表现力，同时保持原意不变：\n\n${content}`,
      config: {
        temperature: 0.5,
      },
    });
    return response.text || content;
  },

  /**
   * Suggests tags for a post
   */
  async generateTags(content: string): Promise<string[]> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `请根据以下文章内容，提取5个最合适的标签（每个标签2-4个字）：\n\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });
    
    try {
      return JSON.parse(response.text || "[]");
    } catch {
      return ["写作", "思绪"];
    }
  },

  /**
   * Summarizes existing content
   */
  async summarizePost(content: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `请为以下博文内容提供一个简短精炼的摘要（100字以内）：\n\n${content}`,
      config: {
        temperature: 0.3,
      },
    });
    return response.text || "摘要生成失败。";
  },

  /**
   * Analyzes relationships between posts
   */
  async findConnections(currentPost: {title: string, content: string}, otherPosts: {id: string, title: string, excerpt: string}[]): Promise<{id: string, reason: string}[]> {
    const ai = getAI();
    const postsData = otherPosts.map(p => `ID: ${p.id}, Title: ${p.title}, Excerpt: ${p.excerpt}`).join('\n');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
              reason: { type: Type.STRING }
            },
            required: ["id", "reason"]
          }
        }
      },
    });
    
    try {
      return JSON.parse(response.text || "[]");
    } catch {
      return [];
    }
  },

  /**
   * Suggests titles for a post
   */
  async suggestTitles(content: string): Promise<string[]> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `根据以下内容，提供5个更具吸引力和SEO友好性的标题：\n\n${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
    });
    
    try {
      return JSON.parse(response.text || "[]");
    } catch {
      return ["无法获取建议"];
    }
  }
};
