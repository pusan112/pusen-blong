
export const blogService = {
  /**
   * 通用调用封装
   */
  async callAI(action: string, payload: any) {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, payload }),
    });
    
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "AI Service Error");
    }
    return response.json();
  },

  async generateDraft(topic: string): Promise<string> {
    const data = await this.callAI("generateDraft", { topic });
    return data.text || "未能生成内容。";
  },

  async generateTags(content: string): Promise<string[]> {
    const data = await this.callAI("generateTags", { content });
    return data.tags || ["写作", "思绪"];
  },

  async summarizePost(content: string): Promise<string> {
    const data = await this.callAI("summarize", { content });
    return data.text || "摘要生成失败。";
  },

  async findConnections(currentPost: {title: string, content: string}, otherPosts: any[]): Promise<any[]> {
    const data = await this.callAI("findConnections", { currentPost, otherPosts });
    return data.connections || [];
  }
};
