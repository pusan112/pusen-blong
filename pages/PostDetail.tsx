
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService } from '../services/gemini';
import { storageService } from '../services/storage';
import { Post } from '../types';

interface Comment {
  id: string;
  author: string;
  text: string;
  date: string;
  tempLikes?: number;
  isLiked?: boolean;
  replies?: Comment[];
}

interface Connection {
  id: string;
  title: string;
  reason: string;
}

const PostDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [showWechatModal, setShowWechatModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  
  // 关联逻辑
  const [aiConnections, setAiConnections] = useState<Connection[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [backlinks, setBacklinks] = useState<Post[]>([]);
  const [showManualLink, setShowManualLink] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 评论状态管理
  const [comments, setComments] = useState<Comment[]>([]);
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');

  const isAdmin = useMemo(() => {
    const users = storageService.getUsers();
    return users.some(u => u.role === 'admin' && u.lastActive && Date.now() - u.lastActive < 24 * 60 * 60 * 1000);
  }, []);

  useEffect(() => {
    if (id) {
      const foundPost = storageService.getPostById(id);
      const all = storageService.getAllPosts(true);
      setAllPosts(all);
      
      if (foundPost) {
        setPost(foundPost);
        // 加载评论
        const savedComments = localStorage.getItem(`comments_${id}`);
        if (savedComments) {
          try {
            const parsed: Comment[] = JSON.parse(savedComments);
            setComments(parsed);
          } catch (e) { console.error(e); }
        }
        
        // 查找反向链接
        const foundBacklinks = all.filter(p => p.id !== id && p.content.includes(`[[${foundPost.title}]]`));
        setBacklinks(foundBacklinks);

        // 自动触发 AI 关联分析（如果尚未加载）
        if (aiConnections.length === 0) {
          handleAutoLink(foundPost, all);
        }
      }
    }
    window.scrollTo(0, 0);
  }, [id]);

  const handleAutoLink = async (current: Post, all: Post[]) => {
    if (isLinking) return;
    setIsLinking(true);
    try {
      const others = all.filter(p => p.id !== current.id).map(p => ({ id: p.id, title: p.title, excerpt: p.excerpt }));
      if (others.length > 0) {
        const results = await blogService.findConnections({ title: current.title, content: current.content }, others);
        const detailedConnections = results.map(res => {
          const p = all.find(item => item.id === res.id);
          return p ? { id: p.id, title: p.title, reason: res.reason } : null;
        }).filter(Boolean) as Connection[];
        setAiConnections(detailedConnections);
      }
    } catch (e) {
      console.error("AI linking failed", e);
    } finally {
      setIsLinking(false);
    }
  };

  const parseContentWithWikiLinks = (text: string) => {
    const parts = text.split(/(\[\[.*?\]\])/g);
    return parts.map((part, i) => {
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const title = part.slice(2, -2);
        const linkedPost = allPosts.find(p => p.title === title);
        if (linkedPost) {
          return (
            <Link 
              key={i} 
              to={`/post/${linkedPost.id}`} 
              className="text-accent font-bold border-b border-dashed border-accent/40 hover:border-accent transition-all px-1 bg-accent/5 rounded"
              title={`跳转至: ${title}`}
            >
              {title}
            </Link>
          );
        }
        return <span key={i} className="text-gray-300" title="未找到相关篇章">{title}</span>;
      }
      return part;
    });
  };

  const handleSummarize = async () => {
    if (!post || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const summary = await blogService.summarizePost(post.content);
      setAiSummary(summary);
    } catch (error) {
      setAiSummary("PUSEN 的 AI 助手暂时无法联系...");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const comment: Comment = {
      id: Date.now().toString(),
      author: newCommentName.trim() || '匿名的路人',
      text: newCommentText.trim(),
      date: new Date().toLocaleDateString('zh-CN'),
      tempLikes: 0,
      isLiked: false,
      replies: []
    };
    setComments(prev => [comment, ...prev]);
    setNewCommentName('');
    setNewCommentText('');
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: post?.title, text: post?.excerpt, url });
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch (err) { alert(text); }
  };

  if (!post) return <div className="min-h-screen flex items-center justify-center text-gray-400 italic">正在寻找那段思绪...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 animate-fade-in-up">
      <header className="mb-16 space-y-8 text-center">
        <Link to="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:text-accent transition-colors">← Back Home</Link>
        <h1 className="text-4xl md:text-6xl font-serif font-black leading-tight tracking-tighter">
          {post.title}
        </h1>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {post.date} • {post.category} • {post.readTime} 阅读
          </div>
        </div>
      </header>

      <div className="mb-16 aspect-video rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-black/5">
        <img src={post.coverImage} className="w-full h-full object-cover" alt={post.title} />
      </div>

      <article className="prose prose-lg max-w-none prose-stone mb-16">
        <div className="space-y-8 text-gray-600 leading-[1.8] text-xl font-light">
          {post.content.split('\n\n').map((p, i) => (
            <p key={i}>{parseContentWithWikiLinks(p)}</p>
          ))}
        </div>
      </article>

      {/* AI 摘要 */}
      <section className="mb-24">
        <div className="glass p-10 rounded-[3rem] border-white/60 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="bg-accent/10 p-2 rounded-xl">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-[11px] font-black text-primary/40 uppercase tracking-widest">PUSEN AI 深度解析</span>
            </div>
            {!aiSummary && !isSummarizing && (
              <button onClick={handleSummarize} className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline">提炼文章精华</button>
            )}
          </div>
          {isSummarizing ? (
            <div className="flex space-x-2 justify-center py-4">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          ) : aiSummary && (
            <p className="text-2xl font-serif italic text-primary/70 text-center leading-relaxed">“{aiSummary}”</p>
          )}
        </div>
      </section>

      {/* 知识图谱关联区 */}
      <section className="mb-24 space-y-12">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 rounded-2xl bg-accent/5 flex items-center justify-center">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4 4a4 4 0 01-5.656 5.656l-1.102-1.101" /></svg>
          </div>
          <h3 className="text-2xl font-serif font-black">思绪回响：花园关联</h3>
          <div className="flex-1 h-px bg-gray-100"></div>
          {isAdmin && (
            <button onClick={() => setShowManualLink(!showManualLink)} className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-accent/5 text-accent rounded-full hover:bg-accent hover:text-white transition-all">建立关联</button>
          )}
        </div>

        {/* 手动关联搜索器 */}
        {showManualLink && (
          <div className="glass p-6 rounded-3xl border-accent/10 animate-in slide-in-from-top-4">
             <input 
               type="text" 
               placeholder="搜索其他思绪的标题..." 
               className="w-full bg-white/50 border-none rounded-xl py-3 px-4 text-sm focus:ring-1 focus:ring-accent outline-none"
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
             />
             {searchQuery && (
               <div className="mt-4 space-y-2">
                 {allPosts.filter(p => p.id !== id && p.title.includes(searchQuery)).map(p => (
                   <button 
                     key={p.id}
                     onClick={() => {
                        const newWikiLink = `\n\n[[${p.title}]]`;
                        // 这是一个模拟操作，实际应调用 storage 更新内容
                        alert(`已在内容末尾模拟添加 WikiLink: ${newWikiLink}`);
                        setSearchQuery('');
                        setShowManualLink(false);
                     }}
                     className="w-full text-left p-3 rounded-xl hover:bg-accent/5 text-xs font-bold text-gray-600 transition-colors flex justify-between items-center"
                   >
                     <span>{p.title}</span>
                     <span className="text-[8px] uppercase tracking-widest text-accent">建立连接 +</span>
                   </button>
                 ))}
               </div>
             )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aiConnections.map(conn => (
            <Link key={conn.id} to={`/post/${conn.id}`} className="glass p-8 rounded-[2.5rem] hover:shadow-xl transition-all border-white/40 group">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-accent mb-4 block">AI Recommended Connection</span>
              <h4 className="text-xl font-serif font-black mb-3 group-hover:text-accent transition-colors">{conn.title}</h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed italic line-clamp-2">“{conn.reason}”</p>
            </Link>
          ))}
          {backlinks.length > 0 && backlinks.map(p => (
            <Link key={p.id} to={`/post/${p.id}`} className="glass p-8 rounded-[2.5rem] hover:shadow-xl transition-all border-gray-100 group bg-gray-50/30">
              <span className="text-[8px] font-black uppercase tracking-[0.3em] text-gray-300 mb-4 block">Mentioned In (Backlink)</span>
              <h4 className="text-xl font-serif font-black mb-3 group-hover:text-accent transition-colors">{p.title}</h4>
              <p className="text-xs text-gray-400 font-light line-clamp-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 评论区 */}
      <section className="mt-24 space-y-12">
        <h3 className="text-2xl font-serif font-black">留下的回响</h3>
        <form onSubmit={handleCommentSubmit} className="glass p-10 rounded-[3rem] border-gray-50 space-y-6">
          <input 
            type="text" placeholder="如何称呼您？" value={newCommentName} onChange={e => setNewCommentName(e.target.value)}
            className="w-full bg-transparent border-b border-gray-100 py-3 text-sm outline-none focus:border-accent transition-all"
          />
          <textarea 
            placeholder="在此写下您的共鸣..." rows={3} value={newCommentText} onChange={e => setNewCommentText(e.target.value)}
            className="w-full bg-transparent border-b border-gray-100 py-3 text-sm outline-none focus:border-accent transition-all resize-none"
            required
          />
          <button type="submit" className="px-10 py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent transition-all">寄出回响</button>
        </form>
        <div className="space-y-8">
          {comments.map(c => (
            <div key={c.id} className="flex space-x-6">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center font-serif font-bold text-gray-300">{c.author.charAt(0)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-center"><span className="font-bold text-sm">{c.author}</span><span className="text-[9px] text-gray-300 uppercase tracking-widest">{c.date}</span></div>
                <p className="text-base text-gray-600 font-light">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-24 pt-12 border-t border-gray-100 flex justify-between items-center">
        <div className="flex space-x-8">
           <button onClick={handleShare} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-black">{copyStatus === 'copied' ? 'Link Copied' : 'Share'}</button>
           <button onClick={() => setShowWechatModal(true)} className="text-[10px] font-black uppercase tracking-widest text-gray-300 hover:text-accent">WeChat</button>
        </div>
        <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline underline-offset-8 decoration-2">返回列表</Link>
      </footer>

      {showWechatModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/5 backdrop-blur-sm" onClick={() => setShowWechatModal(false)}>
          <div className="glass p-12 rounded-[3rem] shadow-2xl max-w-xs w-full text-center space-y-6 animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-serif font-black">分享至微信</h3>
            <div className="bg-white p-4 rounded-3xl inline-block shadow-inner">
               <div className="w-40 h-40 bg-gray-100 rounded-xl flex items-center justify-center text-[10px] text-gray-300 uppercase font-black">QR Code</div>
            </div>
            <button onClick={() => copyToClipboard(window.location.href)} className="w-full py-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl">复制链接</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
