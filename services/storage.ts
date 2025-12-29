import { Post, JoinRequest, User, Moment } from '../types';
import { INITIAL_POSTS } from '../constants';
import { emailService } from './email';

const POSTS_KEY = 'user_custom_posts';
const MOMENTS_KEY = 'user_custom_moments';
const REQUESTS_KEY = 'garden_join_requests';
const USERS_KEY = 'garden_users_auth';
const CODES_KEY = 'garden_temp_codes';

const DEFAULT_ADMIN: User = {
  email: 'admin@garden.com',
  password: '123456',
  role: 'admin',
  lastActive: Date.now()
};

// 初始瞬间数据
const INITIAL_MOMENTS: Moment[] = [
  {
    id: 'm1',
    content: '今天在路边看到一棵树，阳光穿透叶子的那一刻，感觉生命被点亮了。',
    date: '2024-06-05',
    likes: 12,
    images: ['https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=800'],
    author: '林间',
    status: 'approved'
  }
];

export const storageService = {
  // --- 用户与权限管理 ---
  getUsers: (): User[] => {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
      return [DEFAULT_ADMIN];
    }
    return JSON.parse(raw);
  },

  updateUserActivity: (email: string) => {
    const users = storageService.getUsers();
    const updated = users.map(u => 
      u.email === email ? { ...u, lastActive: Date.now() } : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
  },

  updateAdminPassword: (newPassword: string): boolean => {
    const users = storageService.getUsers();
    const updated = users.map(u => 
      u.role === 'admin' ? { ...u, password: newPassword } : u
    );
    localStorage.setItem(USERS_KEY, JSON.stringify(updated));
    return true;
  },

  sendVerificationCode: async (email: string): Promise<{ success: boolean, code?: string, message?: string }> => {
    const users = storageService.getUsers();
    const userExists = users.some(u => u.email === email);
    if (!userExists) return { success: false, message: '该邮箱尚未注册' };

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Fix: Corrected typo from COODES_KEY to CODES_KEY
    const codes = JSON.parse(localStorage.getItem(CODES_KEY) || '{}');
    codes[email] = { code, expires: Date.now() + 5 * 60 * 1000 };
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));

    const emailResult = await emailService.sendVerificationCode(email, code);
    
    if (emailResult.success) {
      return { success: true, code };
    } else {
      return { success: false, message: '邮件服务繁忙，请稍后再试' };
    }
  },

  resetUserPassword: (email: string, code: string, newPassword: string): { success: boolean, message: string } => {
    const codes = JSON.parse(localStorage.getItem(CODES_KEY) || '{}');
    const entry = codes[email];
    if (!entry || entry.code !== code) return { success: false, message: '验证码错误' };
    if (Date.now() > entry.expires) return { success: false, message: '验证码已过期' };

    const users = storageService.getUsers();
    const userExists = users.some(u => u.email === email);
    if (!userExists) return { success: false, message: '用户不存在' };

    const updatedUsers = users.map(u => u.email === email ? { ...u, password: newPassword } : u);
    localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
    delete codes[email];
    localStorage.setItem(CODES_KEY, JSON.stringify(codes));
    return { success: true, message: '密码重置成功' };
  },

  // --- 文章管理 ---
  getAllPosts: (isAdmin: boolean = false): Post[] => {
    const userPostsRaw = localStorage.getItem(POSTS_KEY);
    let userPosts: Post[] = [];
    if (userPostsRaw) {
      try { userPosts = JSON.parse(userPostsRaw); } catch (e) {}
    }
    const initialWithStatus = INITIAL_POSTS.map(p => ({ ...p, status: 'approved' as const }));
    const all = [...userPosts, ...initialWithStatus];
    if (!isAdmin) {
      return all.filter(p => p.status === 'approved').sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getPostById: (id: string): Post | null => {
    const allPosts = storageService.getAllPosts(true);
    return allPosts.find(p => p.id === id) || null;
  },

  savePost: (post: Post): void => {
    const userPostsRaw = localStorage.getItem(POSTS_KEY);
    const userPosts: Post[] = userPostsRaw ? JSON.parse(userPostsRaw) : [];
    const newPost = { ...post, status: 'pending' as const };
    localStorage.setItem(POSTS_KEY, JSON.stringify([newPost, ...userPosts]));
  },

  approvePost: (id: string): void => {
    const userPostsRaw = localStorage.getItem(POSTS_KEY);
    if (!userPostsRaw) return;
    const userPosts: Post[] = JSON.parse(userPostsRaw);
    const updated = userPosts.map(p => p.id === id ? { ...p, status: 'approved' as const } : p);
    localStorage.setItem(POSTS_KEY, JSON.stringify(updated));
  },

  deletePost: (id: string): void => {
    const userPostsRaw = localStorage.getItem(POSTS_KEY);
    if (!userPostsRaw) return;
    const userPosts: Post[] = JSON.parse(userPostsRaw);
    localStorage.setItem(POSTS_KEY, JSON.stringify(userPosts.filter(p => p.id !== id)));
  },

  // --- 瞬间 (Moments) 管理 ---
  getAllMoments: (isAdmin: boolean = false): Moment[] => {
    const raw = localStorage.getItem(MOMENTS_KEY);
    let userMoments: Moment[] = raw ? JSON.parse(raw) : [];
    const all = [...userMoments, ...INITIAL_MOMENTS];
    if (!isAdmin) {
      return all.filter(m => m.status === 'approved').sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  saveMoment: (moment: Moment, role: 'admin' | 'user'): void => {
    const raw = localStorage.getItem(MOMENTS_KEY);
    const moments: Moment[] = raw ? JSON.parse(raw) : [];
    const newMoment = { 
      ...moment, 
      status: role === 'admin' ? ('approved' as const) : ('pending' as const) 
    };
    localStorage.setItem(MOMENTS_KEY, JSON.stringify([newMoment, ...moments]));
  },

  approveMoment: (id: string): void => {
    const raw = localStorage.getItem(MOMENTS_KEY);
    if (!raw) return;
    const moments: Moment[] = JSON.parse(raw);
    const updated = moments.map(m => m.id === id ? { ...m, status: 'approved' as const } : m);
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(updated));
  },

  deleteMoment: (id: string): void => {
    const raw = localStorage.getItem(MOMENTS_KEY);
    if (!raw) return;
    const moments: Moment[] = JSON.parse(raw);
    localStorage.setItem(MOMENTS_KEY, JSON.stringify(moments.filter(m => m.id !== id)));
  },

  // --- 申请管理 ---
  submitJoinRequest: (email: string, reason: string, password?: string): void => {
    const existing = localStorage.getItem(REQUESTS_KEY);
    const requests: JoinRequest[] = existing ? JSON.parse(existing) : [];
    const newReq: JoinRequest = {
      id: `req-${Date.now()}`,
      email,
      password,
      reason,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    localStorage.setItem(REQUESTS_KEY, JSON.stringify([newReq, ...requests]));
  },

  getJoinRequests: (): JoinRequest[] => {
    const existing = localStorage.getItem(REQUESTS_KEY);
    return existing ? JSON.parse(existing) : [];
  },

  handleJoinRequest: (id: string, status: 'approved' | 'rejected'): void => {
    const existing = localStorage.getItem(REQUESTS_KEY);
    if (!existing) return;
    const requests: JoinRequest[] = JSON.parse(existing);
    
    const updated = requests.map(r => {
      if (r.id === id) {
        if (status === 'approved') {
          const users = storageService.getUsers();
          if (!users.some(u => u.email === r.email)) {
            const newUser: User = {
              email: r.email,
              password: r.password || '123456',
              role: 'user',
              lastActive: 0
            };
            localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]));
          }
        }
        return { ...r, status };
      }
      return r;
    });
    // Fix: Corrected key from USERS_KEY to REQUESTS_KEY for saving updated join requests list.
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(updated));
  }
};