import React, { useState, useEffect, useRef } from 'react';
import { storageService } from '../services/storage';
import { Moment } from '../types';

const MomentItem: React.FC<{ moment: Moment }> = ({ moment }) => {
  const [likes, setLikes] = useState(moment.likes);
  const [isLiked, setIsLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<{id:string, author:string, text:string, date:string}[]>([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(`moment_comments_${moment.id}`);
    if (saved) {
      setComments(JSON.parse(saved));
    }
  }, [moment.id]);

  const saveComments = (newComments: any[]) => {
    setComments(newComments);
    localStorage.setItem(`moment_comments_${moment.id}`, JSON.stringify(newComments));
  };

  const handleLike = () => {
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now().toString(),
      author: authorName.trim() || '匿名的路人',
      text: newComment,
      date: '刚刚'
    };

    saveComments([comment, ...comments]);
    setNewComment('');
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{moment.date}</span>
          <span className="text-[9px] font-bold text-accent uppercase tracking-tighter mt-1">{moment.author}</span>
        </div>
        <div className="w-1.5 h-1.5 bg-accent/20 rounded-full"></div>
      </div>
      
      <p className="text-gray-600 leading-relaxed font-light text-lg mb-6 whitespace-pre-wrap">
        {moment.content}
      </p>

      {moment.images && moment.images.length > 0 && (
        <div className={`grid gap-3 mb-6 ${moment.images.length === 1 ? 'grid-cols-1' : moment.images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {moment.images.map((img, i) => (
            <div key={i} className="rounded-3xl overflow-hidden aspect-square ring-1 ring-black/5">
              <img src={img} className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" alt={`Moment Image ${i+1}`} />
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-6">
        <button 
          onClick={handleLike}
          className={`flex items-center space-x-2 transition-all group ${isLiked ? 'text-accent' : 'text-gray-300 hover:text-accent'}`}
        >
          <svg className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current scale-110' : 'fill-none stroke-current'}`} strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-black tabular-nums tracking-tighter">{likes}</span>
        </button>

        <button 
          onClick={() => setShowComments(!showComments)}
          className={`flex items-center space-x-2 transition-all ${showComments ? 'text-black' : 'text-gray-300 hover:text-black'}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[10px] font-black uppercase tracking-widest">{comments.length > 0 ? comments.length : 'Reply'}</span>
        </button>
      </div>

      {showComments && (
        <div className="mt-8 pt-8 border-t border-gray-50 space-y-6 animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmitComment} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100/50">
            <div className="flex flex-col space-y-3">
              <input 
                type="text" 
                placeholder="如何称呼您？" 
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none text-accent placeholder:text-gray-300"
              />
              <textarea 
                placeholder="写下这一刻的共鸣..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-transparent border-none text-sm font-light text-gray-600 resize-none focus:ring-0 outline-none h-12"
                required
              />
              <div className="flex justify-end">
                <button type="submit" className="text-[9px] font-black uppercase tracking-[0.2em] bg-primary text-white px-4 py-2 rounded-full hover:bg-accent transition-all shadow-lg shadow-black/5 active:scale-95">
                  Send
                </button>
              </div>
            </div>
          </form>

          <div className="space-y-6 pl-2">
            {comments.map(comment => (
              <div key={comment.id} className="flex space-x-4 group">
                <div className="w-8 h-8 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-[10px] font-black text-gray-300 group-hover:bg-accent group-hover:text-white transition-all">
                  {comment.author.charAt(0)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{comment.author}</span>
                    <span className="text-[8px] text-gray-300 uppercase font-bold">{comment.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed font-light">{comment.text}</p>
                </div>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-center text-[10px] text-gray-300 uppercase tracking-widest py-4">还没有评论，写下第一个吧</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface MomentsProps {
  isAdmin?: boolean;
}

const Moments: React.FC<MomentsProps> = ({ isAdmin = false }) => {
  const [moments, setMoments] = useState<Moment[]>([]);
  const [newMomentContent, setNewMomentContent] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const users = storageService.getUsers();
    const activeUser = users.find(u => u.lastActive && Date.now() - u.lastActive < 24 * 60 * 60 * 1000);
    if (activeUser) {
      setIsLoggedIn(true);
      setUserEmail(activeUser.email);
    }
    setMoments(storageService.getAllMoments(isAdmin));
  }, [isAdmin]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Fix: Explicitly type 'file' as 'File' to avoid 'unknown' inference which causes a mismatch with the browser's Blob type in readAsDataURL.
    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImages(prev => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePostMoment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMomentContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const users = storageService.getUsers();
    const currentUser = users.find(u => u.email === userEmail);
    const role = currentUser?.role || 'user';

    const moment: Moment = {
      id: `m-${Date.now()}`,
      content: newMomentContent,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      images: selectedImages,
      author: userEmail.split('@')[0],
      authorEmail: userEmail,
      status: role === 'admin' ? 'approved' : 'pending'
    };

    storageService.saveMoment(moment, role);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setNewMomentContent('');
      setSelectedImages([]);
      if (role === 'admin') {
        setMoments(storageService.getAllMoments(isAdmin));
      } else {
        alert('瞬间已发布，待管理员审核后即可公开显示。');
      }
    }, 800);
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-32 animate-fade-in-up">
      <header className="mb-20 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-accent/5 blur-3xl rounded-full -z-10"></div>
        <h1 className="text-5xl font-serif font-black mb-4 tracking-tighter">瞬间</h1>
        <p className="text-gray-400 text-[10px] tracking-[0.4em] uppercase font-bold italic opacity-60">
          “Time is the companion that goes with us on a journey”
        </p>
      </header>

      {isLoggedIn && (
        <section className="mb-16">
          <form onSubmit={handlePostMoment} className="glass p-8 rounded-[2.5rem] border border-accent/5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-accent/20"></div>
            <textarea 
              value={newMomentContent}
              onChange={(e) => setNewMomentContent(e.target.value)}
              placeholder="分享这一刻的思绪..."
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-lg font-light text-gray-600 resize-none h-24 placeholder:text-gray-200"
              required
            />
            
            {selectedImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 animate-in fade-in slide-in-from-bottom-2">
                {selectedImages.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 group">
                    <img src={img} className="w-full h-full object-cover rounded-xl border border-gray-100" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="2.5"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center pt-4 mt-4 border-t border-gray-50">
               <div className="flex items-center space-x-4">
                 <button 
                   type="button"
                   onClick={() => imageInputRef.current?.click()}
                   className="w-10 h-10 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-accent/10 hover:text-accent transition-all"
                   title="添加图片"
                 >
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                   </svg>
                 </button>
                 <input type="file" ref={imageInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                 
                 <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                   Posting as <span className="text-accent">{userEmail.split('@')[0]}</span>
                 </div>
               </div>
               
               <button 
                 type="submit" 
                 disabled={isSubmitting || !newMomentContent.trim()}
                 className="px-8 py-3 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all shadow-lg shadow-black/5 disabled:opacity-30 active:scale-95 flex items-center space-x-2"
               >
                 {isSubmitting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : '发布瞬间'}
               </button>
            </div>
          </form>
        </section>
      )}

      <div className="space-y-12">
        {moments.map(moment => (
          <MomentItem key={moment.id} moment={moment} />
        ))}
        {moments.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-300 italic font-serif">林间还没有被批准公开的瞬间。</p>
          </div>
        )}
      </div>

      <div className="mt-24 text-center">
        <div className="w-12 h-1 bg-gray-100 mx-auto rounded-full mb-8"></div>
        <p className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-black">到底啦，没有更多瞬间了</p>
      </div>
    </div>
  );
};

export default Moments;