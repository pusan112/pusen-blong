// services/db.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

// 这个文件会被后端使用，所以环境变量只在 serverless 中读取
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
