import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <div className="flex flex-col items-center text-center space-y-10">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl ring-8 ring-white">
          <img src="https://picsum.photos/seed/linjian/300" alt="PUSEN" className="w-full h-full object-cover" />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-serif font-black">关于 PUSEN</h1>
          <p className="text-accent font-bold text-xs uppercase tracking-[0.3em]">Designer / Coder / Dreamer</p>
        </div>

        <div className="prose prose-stone text-gray-500 leading-relaxed font-light text-lg">
          <p>
            你好。我是 PUSEN，一个在代码和设计之间寻找平衡的旅人。
          </p>
          <p>
            这个名为“PUSEN”的数字花园，是我在喧嚣互联网中为自己保留的一片安静之地。
            我喜欢在清晨写代码，在雨后读书，在深夜记录那些转瞬即逝的灵感。
          </p>
          <p>
            这里没有复杂的算法推荐，没有耸人听闻的标题，只有我对生活、技术和美学最真实的思考。
            希望这里的某一段文字或某一张图片，也能在你的心中激起一丝涟漪。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full pt-10">
          <div className="p-6 bg-white border border-gray-50 rounded-3xl">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">正在读</h3>
            <p className="text-sm font-serif italic text-gray-600">《瓦尔登湖》</p>
          </div>
          <div className="p-6 bg-white border border-gray-50 rounded-3xl">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-2">正在听</h3>
            <p className="text-sm font-serif italic text-gray-600">Lo-fi Jazz Beats</p>
          </div>
        </div>

        <div className="flex space-x-8 pt-10">
          <a href="#" className="text-gray-300 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest">Email</a>
          <a href="#" className="text-gray-300 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest">Twitter</a>
          <a href="#" className="text-gray-300 hover:text-black transition-colors font-bold text-xs uppercase tracking-widest">GitHub</a>
        </div>
        
        <Link to="/" className="pt-10 text-[10px] font-bold text-gray-300 hover:text-accent uppercase tracking-[0.3em]">
          ← Back to Garden
        </Link>
      </div>
    </div>
  );
};

export default About;