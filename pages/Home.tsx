import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PostCard from '../components/PostCard';
import WeatherWidget from '../components/WeatherWidget';
import { CATEGORIES } from '../constants';
import { Post } from '../types';
import { storageService } from '../services/storage';

interface HomeProps {
  isAdmin?: boolean;
}

const Home: React.FC<HomeProps> = ({ isAdmin = false }) => {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ⭐ 从云端（Supabase）拉文章列表
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const posts = await storageService.getPosts();
        setAllPosts(posts || []);
      } catch (e) {
        console.error(e);
        setError('加载文章失败，请稍后再试。');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin]);

  const filteredPosts = allPosts.filter(post =>
    activeCategory === '全部' || post.category === activeCategory
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&q=80&w=2000" 
            className="w-full h-full object-cover scale-105" 
            alt="Hero Background" 
          />
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 hero-gradient"></div>
        </div>

        <div className="relative z-10 text-center space-y-8 animate-fade-in-up">
          <div className="inline-block px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 animate-float">
            Welcome to Digital Garden
          </div>
          <h2 className="text-6xl md:text-8xl font-serif font-black text-primary tracking-tighter leading-none">
            PUSEN
          </h2>
          <p className="text-gray-400 font-serif italic text-lg max-w-md mx-auto leading-relaxed">
            “万物皆有裂痕，那是光照进来的地方。”
          </p>
          
          <div className="pt-10 flex flex-col items-center">
            <WeatherWidget />
            <div
              className="mt-12 animate-bounce cursor-pointer"
              onClick={() =>
                window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
              }
            >
              <svg
                className="w-6 h-6 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M19 14l-7 7-7-7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <div className="max-w-6xl mx-auto px-8 py-24">
        {/* Categories Bar */}
        <div className="flex justify-between items-end mb-16">
          <div>
            <h3 className="text-3xl font-serif font-black">收纳的思绪</h3>
            <p className="text-xs text-gray-300 uppercase tracking-widest mt-1">
              Collections of thoughts
            </p>
          </div>
          <div className="flex space-x-6 overflow-x-auto no-scrollbar pb-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'text-accent border-b-2 border-accent'
                    : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 加载 & 错误状态 */}
        {loading && (
          <div className="py-20 text-center text-gray-400 text-sm">
            正在从云端唤醒你的思绪...
          </div>
        )}

        {error && !loading && (
          <div className="py-20 text-center text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Post Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {filteredPosts.map((post, idx) => (
              <PostCard
                key={post.id}
                post={post}
                featured={idx === 0 && activeCategory === '全部'}
              />
            ))}
            {filteredPosts.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-300 italic font-serif">
                  这片花园里还没有此类授权通过的思绪。
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Footer Link */}
        <div className="mt-24 text-center">
          <Link
            to="/archive"
            className="inline-flex items-center space-x-3 px-10 py-4 glass rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-500"
          >
            <span>浏览全部存档</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M17 8l4 4m0 0l-4 4m4-4H3"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
