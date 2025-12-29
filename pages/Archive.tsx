
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storage';
import { Post } from '../types';

const Archive: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allPosts, setAllPosts] = useState<Post[]>([]);

  useEffect(() => {
    setAllPosts(storageService.getAllPosts());
  }, []);

  const filteredPosts = allPosts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <header className="mb-12">
        <h1 className="text-4xl font-serif font-black mb-4">时间轴</h1>
        <p className="text-gray-400 text-sm italic mb-8">“在这里，时间被凝固成文字。”</p>
        
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="在往事中检索..."
            className="w-full bg-white/50 border border-gray-100 rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/10 focus:border-accent/30 transition-all placeholder:text-gray-300"
          />
        </div>
      </header>

      <div className="space-y-12 min-h-[300px]">
        {filteredPosts.length > 0 ? (
          <div className="relative border-l border-gray-100 pl-8 ml-2">
            {filteredPosts.map(post => (
              <div key={post.id} className="mb-10 relative group">
                <div className="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-gray-100 group-hover:border-accent transition-colors"></div>
                <div className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-1">
                  {post.date}
                </div>
                <Link 
                  to={`/post/${post.id}`} 
                  className="text-xl font-serif font-bold text-gray-700 hover:text-accent transition-colors block"
                >
                  {post.title}
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
             <p className="text-gray-300 italic font-serif">未能寻得相关记忆。</p>
          </div>
        )}
      </div>

      <div className="mt-20 pt-10 border-t border-gray-100">
        <Link to="/" className="text-xs font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest">
          ← 返回首页
        </Link>
      </div>
    </div>
  );
};

export default Archive;
