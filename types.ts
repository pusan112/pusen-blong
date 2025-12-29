
export interface Post {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  coverImage: string;
  readTime: string;
  status?: 'pending' | 'approved';
}

export interface Moment {
  id: string;
  content: string;
  date: string;
  likes: number;
  images: string[];
  author: string;
  authorEmail?: string;
  status: 'pending' | 'approved';
}

export interface JoinRequest {
  id: string;
  email: string;
  password?: string; // 申请时填写的密码
  reason: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface User {
  email: string;
  password?: string;
  role: 'admin' | 'user';
  lastActive?: number;
}

export type Category = '科技' | '生活' | '设计' | '人工智能' | '人文' | '技术' | '感悟' | '摄影' | '书单';

export interface AIResponse {
  content: string;
  suggestions?: string[];
}
