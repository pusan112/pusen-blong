
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { blogService } from '../../../services/ai-client';
import { storageService } from '../../../services/storage';
import { Post } from '../../../types';
import Navigation from '../../../components/Navigation';

const PostDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [aiConnections, setAiConnections] = useState<any[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  useEffect(() => {
    if (id) {
      const foundPost = storageService.getPostById(id);
      const all = storageService.getAllPosts(true);
      setAllPosts(all);
      
      if (foundPost) {
        setPost(foundPost);
        // 获取 AI 关联
        handleAutoLink(foundPost, all);
      }
    }
  }, [id]);

  const handleAutoLink = async (current: Post, all: Post[]) => {
    if (isLinking) return;
    setIsLinking(true);
    try {
      const others = all.filter(p => p.id !== current.id).map(p => ({ id: p.id, title: p.title, excerpt: p.excerpt }));
      if (others.length > 0) {
        const results = await blogService.findConnections(current, others);
        setAiConnections(results);
      }
    } catch (e) {
      console.error("Linking failed", e);
    } finally {
      setIsLinking(false);
    }
  };

  const handleSummarize = async () => {
    if (!post || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const summary = await blogService.summarizePost(post.content);
      setAiSummary(summary);
    } catch (error) {
      setAiSummary("AI 助手暂时无法联系...");
    } finally {
      setIsSummarizing(false);
    }
  };

  if (!post) return <div className="p-20 text-center font-serif italic text-gray-400">正在寻找那段思绪...</div>;

  return (
    <div className="min-h-screen bg-bgWarm">
      <Navigation />
      <div className="max-w-3xl mx-auto px-6 py-32">
        <header className="mb-16 space-y-8 text-center animate-fade-in-up">
          <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-accent">← Back Home</Link>
          <h1 className="text-4xl md:text-6xl font-serif font-black leading-tight tracking-tighter">{post.title}</h1>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{post.date} • {post.category}</div>
        </header>

        <div className="mb-16 aspect-video rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
          <img src={post.coverImage} className="w-full h-full object-cover" alt={post.title} />
        </div>

        <article className="prose prose-lg max-w-none prose-stone mb-16 text-gray-600 leading-[1.8] text-xl font-light">
          {post.content.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
        </article>

        {/* AI 摘要 */}
        <div className="glass p-10 rounded-[3rem] mb-24 text-center">
           <h3 className="text-[10px] font-black text-accent uppercase tracking-widest mb-4">AI 深度解析</h3>
           {aiSummary ? (
             <p className="text-2xl font-serif italic text-primary/70">“{aiSummary}”</p>
           ) : (
             <button onClick={handleSummarize} disabled={isSummarizing} className="text-accent hover:underline text-sm font-bold">
               {isSummarizing ? '解析中...' : '提炼文章精华'}
             </button>
           )}
        </div>

        {/* 关联推荐 */}
        {aiConnections.length > 0 && (
          <div className="space-y-8">
            <h3 className="text-2xl font-serif font-black border-l-4 border-accent pl-6">思绪回响</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {aiConnections.map(conn => {
                const target = allPosts.find(p => p.id === conn.id);
                return target ? (
                  <Link key={conn.id} href={`/post/${conn.id}`} className="glass p-8 rounded-[2.5rem] hover:shadow-xl transition-all">
                    <h4 className="text-xl font-serif font-black mb-2">{target.title}</h4>
                    <p className="text-xs text-gray-400 italic">“{conn.reason}”</p>
                  </Link>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostDetailPage;
