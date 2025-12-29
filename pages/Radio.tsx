import React, { useState, useEffect, useRef } from 'react';

const Radio: React.FC = () => {
  const [beatIntensity, setBeatIntensity] = useState(1);

  // 模拟心跳节奏变化：随机触发重音脉冲
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const triggerPulse = () => {
      setBeatIntensity(1.2); // 脉冲强度
      setTimeout(() => setBeatIntensity(1), 250);
      
      // 随机下一次心跳的时间 (600ms - 1100ms) 模拟 65-100 BPM
      const nextBeat = 600 + Math.random() * 500;
      timeout = setTimeout(triggerPulse, nextBeat);
    };

    triggerPulse();
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-bgWarm pt-32 pb-20 px-6 animate-fade-in-up relative overflow-hidden transition-colors duration-1000">
      
      {/* 动态背景：随心跳同步的“生命核芯” */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full blur-[180px] pointer-events-none transition-all duration-700 opacity-20"
        style={{ 
          background: `radial-gradient(circle, ${beatIntensity > 1.1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(139, 92, 246, 0.4)'} 0%, rgba(253, 252, 251, 0) 70%)`,
          transform: `translate(-50%, -50%) scale(${beatIntensity})`,
        }}
      ></div>

      {/* 核心心电图 (ECG) 背景 */}
      <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-[300px] pointer-events-none z-0 overflow-hidden opacity-30">
        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path
            d="M 0 50 L 300 50 L 310 40 L 320 60 L 330 20 L 345 90 L 360 50 L 1000 50"
            className={`fill-none stroke-accent transition-all duration-300 ${beatIntensity > 1.1 ? 'stroke-[3px]' : 'stroke-[1px]'}`}
            style={{
              strokeDasharray: '1000',
              strokeDashoffset: beatIntensity > 1.1 ? '0' : '1000',
              filter: 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.8))',
              transform: `scaleY(${beatIntensity > 1.1 ? 1.5 : 0.8})`,
              transformOrigin: 'center'
            }}
          />
          {/* 连续流动的背景心电图线条 */}
          <path
            d="M 0 50 Q 50 50 100 50 T 200 50 T 300 50 T 400 50 T 500 50 T 600 50 T 700 50 T 800 50 T 900 50 T 1000 50"
            className="fill-none stroke-accent/10 stroke-[0.5px] animate-ecg-flow"
          />
        </svg>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 text-center relative">
          <div className="inline-block px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-4 border border-accent/10">
            Vital Rhythm Station
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black mb-4">
            PUSEN<span className="italic text-accent ml-2">电台</span>
          </h1>
          
          {/* 实时心率状态指示 */}
          <div className="flex justify-center items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
             <div className={`w-2 h-2 rounded-full transition-all duration-150 ${beatIntensity > 1.1 ? 'bg-red-500 scale-125 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-accent opacity-30'}`}></div>
             <span>ECG Monitor: Active</span>
             <span className="opacity-40">|</span>
             <span className="text-accent italic">BPM: {Math.floor(72 + Math.random() * 8)}</span>
          </div>
        </header>

        {/* 沉浸式律动容器 */}
        <div className="relative group">
          {/* 容器后方的脉冲光晕 */}
          <div className={`absolute -inset-4 bg-accent/20 rounded-[5rem] blur-3xl transition-opacity duration-300 ${beatIntensity > 1.1 ? 'opacity-50' : 'opacity-0'}`}></div>
          
          <div 
            className="relative glass rounded-[4rem] overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.12)] border border-white/80 h-[750px] w-full transition-all duration-300 ease-out"
            style={{ 
              transform: `scale(${1 + (beatIntensity - 1) * 0.08})`,
              borderColor: beatIntensity > 1.1 ? 'rgba(139, 92, 246, 0.6)' : 'rgba(255, 255, 255, 0.8)',
              boxShadow: beatIntensity > 1.1 ? '0 0 60px rgba(139, 92, 246, 0.15)' : '0 32px 80px -12px rgba(0,0,0,0.12)'
            }}
          >
            <div className="absolute inset-0 bg-white/5 flex items-center justify-center -z-10">
              <div className="flex flex-col items-center space-y-6">
                 <div className="w-16 h-16 relative">
                   <div className="absolute inset-0 border-4 border-accent/10 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin"></div>
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300 animate-pulse">Syncing Vitality...</span>
              </div>
            </div>
            
            <iframe 
              src="https://web.gxnas.com/music/index.html" 
              className="w-full h-full border-none opacity-95 transition-all duration-500 hover:opacity-100"
              title="PUSEN Main Radio"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              style={{ mixBlendMode: 'multiply' }}
            />
          </div>
        </div>

        {/* 底部节奏感应带 */}
        <div className="mt-12 flex flex-col items-center space-y-8">
           <div className="flex space-x-1.5 h-10 items-end">
              {[...Array(50)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-0.5 bg-accent/20 rounded-full transition-all duration-200"
                  style={{ 
                    height: beatIntensity > 1.1 ? `${Math.random() * 80 + 20}%` : `${Math.random() * 40 + 10}%`,
                    opacity: beatIntensity > 1.1 ? 0.6 : 0.2,
                    backgroundColor: beatIntensity > 1.1 && i % 3 === 0 ? '#8b5cf6' : ''
                  }}
                ></div>
              ))}
           </div>
           
           <div className="flex justify-center items-center space-x-12 opacity-30">
              <FeatureHint label="Bio-Rhythm" active={beatIntensity > 1.1} />
              <FeatureHint label="Neural Sync" active={beatIntensity > 1.1} />
              <FeatureHint label="Pulse Engine" active={beatIntensity > 1.1} />
           </div>
        </div>
      </div>

      <style>{`
        @keyframes ecg-flow {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ecg-flow {
          animation: ecg-flow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

const FeatureHint: React.FC<{ label: string; active: boolean }> = ({ label, active }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${active ? 'bg-accent' : 'bg-gray-300'}`}></div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </div>
);

export default Radio;