import { createClient } from "@supabase/supabase-js";

// 从环境变量中获取 Supabase URL 和匿名密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// 如果环境变量缺失，给出警告
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY, check your .env"
  );
}

// 创建 Supabase 客户端
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
