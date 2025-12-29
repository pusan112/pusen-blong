
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const MusicPlayer: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isLyricMode, setIsLyricMode] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // 如果在电台页面，隐藏全局浮动播放器以避免冲突
  if (location.pathname === '/radio') return null;
  // 如果在影视页面，隐藏以防干扰视听
  if (location.pathname === '/cinema') return null;

  return (
    <div className="fixed bottom-8 left-8 z-[200] flex flex-col items-start pointer-events-none">
      
      {/* 外部播放器容器 */}
      <div className={`transition-all duration-700 transform origin-bottom-left pointer-events-auto ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0 translate-x-0' 
          : 'opacity-0 scale-75 translate-y-12 -translate-x-12 pointer-events-none'
      }`}>
        <div className={`relative glass rounded-[2.5rem] shadow-[0_40px_120px_rgba(0,0,0,0.2)] border border-white/60 overflow-hidden transition-all duration-700 ease-in-out ${
          isLyricMode ? 'w-[850px] h-[620px]' : 'w-[360px] h-[580px]'
        } group`}>
          
          {/* 顶部交互条 */}
          <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white/40 to-transparent z-10 flex items-center justify-between px-8">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1">
                 <div className="w-1 h-3 bg-accent/40 rounded-full animate-music-bar-1"></div>
                 <div className="w-1 h-4 bg-accent/60 rounded-full animate-music-bar-2"></div>
                 <div className="w-1 h-3 bg-accent/40 rounded-full animate-music-bar-3"></div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40">Garden Lyric Focus</span>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* 歌词聚焦模式开关 */}
              <button 
                onClick={() => setIsLyricMode(!isLyricMode)} 
                className={`flex items-center space-x-2 px-3 py-1 rounded-full transition-all border ${
                  isLyricMode 
                    ? 'bg-accent text-white border-accent shadow-lg shadow-accent/20' 
                    : 'bg-white/40 text-gray-400 border-white/60 hover:text-accent hover:border-accent/40'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {isLyricMode ? '收起歌词' : '展现歌词'}
                </span>
              </button>
              
              <button onClick={() => setIsOpen(false)} className="text-primary/40 hover:text-accent transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round"/></svg>
              </button>
            </div>
          </div>

          <div className="flex h-full">
            {/* 核心播放器 Iframe */}
            <div className={`h-full transition-all duration-700 bg-black/5 ${isLyricMode ? 'w-[40%]' : 'w-full'}`}>
              <iframe 
                src="https://web.gxnas.com/music/index.html" 
                className="w-full h-full border-none opacity-90 hover:opacity-100 transition-opacity"
                title="External Music Player"
                allow="autoplay"
                style={{ filter: 'contrast(1.02) brightness(1.02)' }}
              />
            </div>
            
            {/* 扩展歌词聚焦区 */}
            {isLyricMode && (
              <div className="flex-1 bg-white/30 backdrop-blur-2xl border-l border-white/40 animate-in slide-in-from-left-8 duration-700 overflow-hidden relative">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                  <div className="max-w-xs space-y-8 relative z-10">
                    <div className="relative inline-block">
                       <div className="absolute -inset-6 bg-accent/20 blur-3xl rounded-full animate-pulse"></div>
                       <svg className="w-14 h-14 text-accent/40 relative" fill="currentColor" viewBox="0 0 24 24">
                         <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                       </svg>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-2xl font-serif font-black text-primary/80">沉浸歌词视界</h4>
                      <p className="text-xs text-gray-500 leading-relaxed font-light">
                        已为您开启专注模式。<br/>
                        请点击播放器内的 <span className="font-bold text-accent mx-1 italic">「词」</span> 按钮<br/>
                        开启同步滚动的文字旅程。
                      </p>
                    </div>

                    <div className="flex justify-center space-x-3">
                       {[...Array(3)].map((_, i) => (
                         <div key={i} className="w-1.5 h-1.5 rounded-full bg-accent/30 animate-bounce" style={{ animationDelay: `${i*0.15}s` }}></div>
                       ))}
                    </div>
                  </div>
                </div>

                {/* 底部动态装饰 - 模拟声波 */}
                <div className="absolute bottom-12 left-0 right-0 px-12 opacity-[0.08] flex justify-between items-end h-32">
                   {[...Array(30)].map((_, i) => (
                     <div 
                      key={i} 
                      className="w-1 bg-accent rounded-full animate-music-bar-1" 
                      style={{ 
                        height: `${Math.random()*90 + 10}%`, 
                        animationDelay: `${i*0.04}s`,
                        animationDuration: `${0.4 + Math.random()}s`
                      }}
                     ></div>
                   ))}
                </div>
                
                {/* 氛围文字装饰 */}
                <div className="absolute top-20 right-8 rotate-90 origin-right text-[10px] font-black uppercase tracking-[0.5em] text-accent/10 select-none">
                  POETRY IN MOTION • HARMONY OF SOUL
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 唱片机式启动按钮 */}
      <div className="mt-4 pointer-events-auto group flex items-center space-x-5">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={`relative w-16 h-16 rounded-full glass border-2 border-white/80 shadow-2xl flex items-center justify-center transition-all duration-500 overflow-hidden ${
            isOpen ? 'rotate-[135deg] scale-90 bg-white/40' : 'hover:scale-110 active:scale-95'
          }`}
        >
          {/* 动态音轨圆环 */}
          <div className={`absolute inset-0 border-[3px] border-dashed border-accent/20 rounded-full animate-spin-slow ${isOpen ? 'opacity-100' : 'opacity-0'}`}></div>
          
          {isOpen ? (
             <svg className="w-6 h-6 text-accent transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3" strokeLinecap="round"/></svg>
          ) : (
            <div className="relative">
               <svg className="w-8 h-8 text-primary/40 group-hover:text-accent transition-colors" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
               </svg>
               {/* 顶部跳动音符装饰 */}
               <div className="absolute -top-1 -right-1 flex space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-0.5 h-2 bg-accent animate-music-bar-1"></div>
                 <div className="w-0.5 h-3 bg-accent animate-music-bar-2"></div>
               </div>
            </div>
          )}
        </button>

        <div className={`flex flex-col transition-all duration-500 overflow-hidden whitespace-nowrap ${
          isHovered && !isOpen ? 'max-w-[200px] opacity-100 translate-x-0' : 'max-w-0 opacity-0 -translate-x-4'
        }`}>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">聆听林间共鸣</span>
          <span className="text-[8px] font-bold text-gray-400 uppercase">Music & Poetic Lyrics</span>
        </div>
      </div>

      <style>{`
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes music-bar { 0%, 100% { transform: scaleY(0.6); } 50% { transform: scaleY(1.3); } }
        .animate-music-bar-1 { animation: music-bar 0.8s ease-in-out infinite; }
        .animate-music-bar-2 { animation: music-bar 0.8s ease-in-out infinite 0.2s; }
        .animate-music-bar-3 { animation: music-bar 0.8s ease-in-out infinite 0.4s; }
      `}</style>
    </div>
  );
};

export default MusicPlayer;
