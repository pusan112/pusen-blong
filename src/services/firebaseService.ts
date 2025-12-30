// src/services/firebaseService.ts
import { firestore } from "./firebaseClient"; // 导入已配置好的 firestore
import { collection, getDocs, query, orderBy } from "firebase/firestore";

// 获取所有文章
export const getPostsFromFirebase = async () => {
  try {
    const postsCol = collection(firestore, "posts");
    // 若你 posts 里有 createdAt 字段，则这样排序；否则可去掉 orderBy
    const q = query(postsCol, orderBy("createdAt", "desc"));

    const snapshot = await getDocs(q);
    const posts: any[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    return posts;
  } catch (error) {
    console.error("Firebase get posts error:", error);
    throw error;
  }
};
