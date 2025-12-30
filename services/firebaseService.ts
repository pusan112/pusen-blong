import { firestore } from './firebaseClient';
import { collection, getDocs, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Post {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt: any;
  [key: string]: any; // 允许其他自定义字段
}

// 获取所有文章
export const getPostsFromFirebase = async (): Promise<Post[]> => {
  try {
    const postsCollection = collection(firestore, "posts");
    // 注意：如果你的 Firestore 索引未建立，orderBy 可能会报错，需在控制台点击提示链接建立索引
    const q = query(postsCollection, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // 将 Firebase Timestamp 转换为标准的 JS Date，方便前端显示
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      } as Post;
    });
  } catch (error) {
    console.error("Firebase Fetch Error:", error);
    throw new Error('无法从云端获取文章数据');
  }
};

// 添加新文章
export const addPostToFirebase = async (post: Omit<Post, 'id'>) => {
  try {
    const postsCollection = collection(firestore, "posts");
    const docRef = await addDoc(postsCollection, {
      ...post,
      createdAt: Timestamp.now() // 自动添加服务器时间
    });
    return docRef.id;
  } catch (error) {
    throw new Error('无法保存文章到云端');
  }
};
