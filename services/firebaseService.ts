// src/services/firebaseService.ts
import { firestore } from './firebaseClient';  // 引入已经配置好的 Firebase 客户端
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';

// 获取所有文章
export const getPostsFromFirebase = async () => {
  try {
    const postsCollection = collection(firestore, "posts"); // 获取 'posts' 集合
    const q = query(postsCollection, orderBy("createdAt", "desc")); // 按创建时间倒序排序
    const querySnapshot = await getDocs(q);
    const posts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return posts;
  } catch (error) {
    throw new Error('无法获取文章数据');
  }
};

// 添加新的文章
export const addPostToFirebase = async (post: any) => {
  try {
    const postsCollection = collection(firestore, "posts");
    const docRef = await addDoc(postsCollection, post);
    return docRef.id;
  } catch (error) {
    throw new Error('无法保存文章');
  }
};
