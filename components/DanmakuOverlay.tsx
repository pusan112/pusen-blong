
import React, { useState, useEffect, useCallback, useRef } from 'react';

interface DanmakuMessage {
  id: string;
  text: string;
  track: number;
  duration: number;
  color?: string;
}

const PRESET_DANMAKU = [
  "万物皆有裂痕，那是光照进来的地方。",
  "所有的草木都在春天里暗暗较劲。",
  "雨声让思绪变得潮湿且绵长。",
  "在代码里寻找诗意，在生活里寻找逻辑。",
  "愿你遍历山河，觉得人间值得。",
  "此时此刻，风正温柔。",
  "在这个数字花园里，我们都是旅客。",
  "慢下来，去听花开的声音。",
  "每一个不曾起舞的日子，都是对生命的辜负。",
  "心之所向，素履以往。"
];

const DanmakuOverlay: React.FC = () => {
  const [messages, setMessages] = useState<DanmakuMessage[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const lastTrackRef = useRef<number>(0);
  const totalTracks = 8; // 屏幕上显示的并行轨道数

  // 发送弹幕的逻辑
  const spawnDanmaku = useCallback((text: string, isUser = false) => {
    const id = Math.random().toString(36).substr(2, 9);
    const duration = 15 + Math.random() * 10; // 15-25秒
    const track = (lastTrackRef.current + 1) % totalTracks;
    lastTrackRef.current = track;

    const newMessage: DanmakuMessage = {
      id,
      text,
      track,
      duration,
      color: isUser ? '#8b5cf6' : undefined
    };

    setMessages(prev => [...prev, newMessage]);

    // 清理已结束的弹幕
    setTimeout(() => {
      setMessages(prev => prev.filter(m => m.id !== id));
    }, duration * 1000);
  }, []);

  // 初始加载及循环
  useEffect(() => {
    if (!isVisible) return;

    // 初始展示几个
    PRESET_DANMAKU.slice(0, 5).forEach((text, i) => {
      setTimeout(() => spawnDanmaku(text), i * 1500);
    });

    const interval = setInterval(() => {
      const randomText = PRESET_DANMAKU[Math.floor(Math.random() * PRESET_DANMAKU.length)];
      spawnDanmaku(randomText);
    }, 4500);

    return () => clearInterval(interval);
  }, [isVisible, spawnDanmaku]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    spawnDanmaku(inputValue, true);
    setInputValue('');
    setInputVisible(false);
  };

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-24 right-8 z-[100] w-10 h-10 glass rounded-full flex items-center justify-center text-gray-400 hover:text-accent transition-all"
        title="开启弹幕"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden">
        {messages.map(msg => (
          <div
            key={msg.id}
            className="absolute whitespace-nowrap text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full animate-danmaku select-none"
            style={{
              top: `${(msg.track * 8) + 15}%`,
              animationDuration: `${msg.duration}s`,
              color: msg.color || 'rgba(45, 42, 46, 0.4)',
              background: msg.color ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(4px)',
              border: msg.color ? '1px solid rgba(139, 92, 246, 0.1)' : '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
            }}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div className="fixed bottom-24 right-8 z-[100] flex flex-col items-end space-y-4">
        {inputVisible && (
          <form onSubmit={handleSend} className="glass p-4 rounded-[2rem] shadow-2xl animate-in slide-in-from-right-4 duration-500 w-64">
            <input 
              autoFocus
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="发送一条弹幕..."
              className="w-full bg-transparent border-none outline-none text-xs font-bold text-gray-600 placeholder:text-gray-300 px-2"
            />
            <div className="flex justify-end mt-3">
              <button type="submit" className="text-[9px] font-black uppercase tracking-widest text-accent px-4 py-1.5 bg-accent/5 rounded-full hover:bg-accent/10 transition-all">Send</button>
            </div>
          </form>
        )}

        <div className="flex items-center space-x-2">
           <button 
            onClick={() => setIsVisible(false)}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-accent shadow-lg hover:scale-110 transition-all"
            title="关闭弹幕"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          
          <button 
            onClick={() => setInputVisible(!inputVisible)}
            className="px-6 py-2.5 glass rounded-full flex items-center space-x-3 text-gray-500 hover:text-accent shadow-lg transition-all group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest">发射思绪</span>
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default DanmakuOverlay;
