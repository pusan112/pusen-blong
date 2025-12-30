// services/storageService.ts
import { supabase } from './supabaseClient'; // 引入配置好的 Supabase 客户端

// 保存新的文章
export const savePost = async (post: any) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([post]);

  if (error) {
    throw new Error('Failed to save post: ' + error.message);
  }

  return data;
};

// 获取所有文章
export const getPosts = async () => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });  // 按照创建时间倒序排序

  if (error) {
    throw new Error('Failed to fetch posts: ' + error.message);
  }

  return data;
};

// 获取单篇文章
export const getPost = async (id: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();  // 获取单篇文章

  if (error) {
    throw new Error('Failed to fetch post: ' + error.message);
  }

  return data;
};

// 更新文章的标签
export const updatePostTags = async (postId: string, tags: string[]) => {
  const { data, error } = await supabase
    .from('posts')
    .update({ tags })  // 更新标签
    .eq('id', postId);  // 通过文章 ID 定位

  if (error) {
    throw new Error('Failed to update post tags: ' + error.message);
  }

  return data;
};

// 更新用户活跃度
export const updateUserActivity = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .update({ last_active: new Date() })  // 更新用户的最后活跃时间
    .eq('email', email);  // 通过用户的邮箱定位

  if (error) {
    throw new Error('Failed to update user activity: ' + error.message);
  }

  return data;
};

// 获取用户信息
export const getUserInfo = async (email: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();  // 获取单个用户的信息

  if (error) {
    throw new Error('Failed to fetch user info: ' + error.message);
  }

  return data;
};

// 获取所有文章的分页
export const getPostsWithPagination = async (page: number, pageSize: number) => {
  const { data, error, count } = await supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .range((page - 1) * pageSize, page * pageSize - 1) // 使用分页
    .order('created_at', { ascending: false });  // 按照创建时间倒序排序

  if (error) {
    throw new Error('Failed to fetch posts with pagination: ' + error.message);
  }

  return { posts: data, total: count };
};
