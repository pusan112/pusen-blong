// api/posts.ts
import { supabase } from "../services/db";

// 简单的 Post 类型（和你的 types.ts 对应起来会更好）
type Post = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  coverImage: string | null;
  readTime: string;
};

export default async function handler(req: any, res: any) {
  if (req.method === "GET") {
    // 获取所有文章（你可以后面加分页）
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch posts error:", error);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }

    // 这里简单返回 data，前端自己适配
    return res.status(200).json({ posts: data });
  }

  if (req.method === "POST") {
    const body = req.body as Post;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        title: body.title,
        excerpt: body.excerpt,
        content: body.content,
        author: body.author,
        date: body.date,
        category: body.category,
        tags: body.tags,
        // 这里假设你 Supabase 表里字段名是 cover_image / read_time
        cover_image: body.coverImage,
        read_time: body.readTime,
      })
      .select()
      .single();

    if (error) {
      console.error("Insert post error:", error);
      return res.status(500).json({ error: "Failed to save post" });
    }

    return res.status(200).json({ post: data });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
