import React from 'react';

const Cinema: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-20 px-6 animate-fade-in-up relative overflow-hidden">
      {/* 极光背景特效 - 更加深邃的氛围 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-accent/10 blur-[180px] pointer-events-none opacity-40"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/10 blur-[120px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-12 text-center">
          <div className="inline-block px-4 py-1.5 bg-white/5 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.4em] text-accent mb-4 border border-white/10">
            Immersive Digital Theater
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-black mb-4 text-white">
            PUSEN<span className="italic text-accent ml-2">影院</span>
          </h1>
          <p className="text-gray-500 text-sm italic font-serif">“暂别繁杂，潜入光影的深海。”</p>
        </header>

        {/* 影视 Iframe 容器 */}
        <div className="relative group">
          {/* 屏幕辉光效果 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-purple-500/20 to-accent/40 rounded-[3rem] blur-3xl opacity-0 group-hover:opacity-20 transition duration-1000"></div>
          
          <div className="relative bg-black rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.8)] border border-white/5 aspect-video w-full">
            {/* 加载提示占位 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 bg-[#0a0a0a]">
               <div className="w-16 h-16 relative">
                 <div className="absolute inset-0 border-4 border-accent/10 rounded-full"></div>
                 <div className="absolute inset-0 border-4 border-t-accent rounded-full animate-spin"></div>
               </div>
               <span className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">正在链接私人放映厅...</span>
            </div>
            
            {/* 更新后的影视接口 URL */}
            <iframe 
              src="https://tv.ecut.qzz.io/" 
              className="w-full h-full border-none opacity-0 transition-opacity duration-1000"
              title="PUSEN Cinema Hub"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            />
          </div>
        </div>

        {/* 控制辅助提示 */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <FeatureItem icon="HD" title="超清画质" desc="支持 4K 极清流媒体体验" />
          <FeatureItem icon="AD" title="沉浸音效" desc="动态均衡，身临其境" />
          <FeatureItem icon="FS" title="全屏沉浸" desc="点击右下角开启无界视界" />
        </div>
      </div>
    </div>
  );
};

const FeatureItem: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex flex-col items-center text-center space-y-2 group">
    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-accent group-hover:bg-accent group-hover:text-white transition-all">
      {icon}
    </div>
    <h4 className="text-white text-xs font-bold uppercase tracking-widest">{title}</h4>
    <p className="text-gray-600 text-[10px] font-medium">{desc}</p>
  </div>
);

export default Cinema;