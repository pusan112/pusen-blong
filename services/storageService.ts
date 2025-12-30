// services/storageService.ts
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { firestore } from "./firebaseClient";
import type { Post } from "../types";

// Firestore 里的集合名称
const postsCol = collection(firestore, "posts");
const usersCol = collection(firestore, "users");

export const storageService = {
  // 保存文章（写文章页用）
  async savePost(post: Omit<Post, "id">) {
    const docRef = await addDoc(postsCol, {
      ...post,
      created_at: serverTimestamp(),
    });
    return docRef.id;
  },

  // 获取所有文章（首页 / Archive 用）
  async getAllPosts(): Promise<Post[]> {
    const q = query(postsCol, orderBy("created_at", "desc"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        author: data.author,
        date: data.date,
        category: data.category,
        tags: data.tags || [],
        coverImage: data.coverImage,
        readTime: data.readTime,
      } as Post;
    });
  },

  // 详情页：通过 id 获取文章
  async getPostById(id: string): Promise<Post | null> {
    const ref = doc(firestore, "posts", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as any;
    return {
      id: snap.id,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      author: data.author,
      date: data.date,
      category: data.category,
      tags: data.tags || [],
      coverImage: data.coverImage,
      readTime: data.readTime,
    } as Post;
  },

  // 更新标签（可以以后在 Dashboard 里用）
  async updatePostTags(postId: string, tags: string[]) {
    const ref = doc(firestore, "posts", postId);
    await updateDoc(ref, { tags });
  },

  // 用户活跃度（你 App.tsx 里有心跳）
  async updateUserActivity(email: string) {
    // 简单版本：用 email 当文档 id
    const ref = doc(usersCol, email);
    await updateDoc(ref, {
      last_active: serverTimestamp(),
    }).catch(async () => {
      // 如果用户不存在就顺便创建一下
      await addDoc(usersCol, {
        email,
        last_active: serverTimestamp(),
      });
    });
  },
};
