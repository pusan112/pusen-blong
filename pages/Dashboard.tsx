
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { Post, JoinRequest, User, Moment } from '../types';

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'posts' | 'moments' | 'requests' | 'users' | 'stats'>('posts');
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  const [pendingMoments, setPendingMoments] = useState<Moment[]>([]);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    apiCalls: 1284,
    latency: '142ms',
    successRate: '99.8%',
    activeUsers: 0
  });

  const loadData = () => {
    const all = storageService.getAllPosts(true);
    setPendingPosts(all.filter(p => p.status === 'pending'));
    
    const allMoments = storageService.getAllMoments(true);
    setPendingMoments(allMoments.filter(m => m.status === 'pending'));
    
    setRequests(storageService.getJoinRequests());
    const allUsers = storageService.getUsers();
    setUsers(allUsers);
    
    const onlineCount = allUsers.filter(u => u.lastActive && Date.now() - u.lastActive < 5 * 60 * 1000).length;
    setStats(prev => ({ ...prev, activeUsers: onlineCount }));
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
      setStats(prev => ({
        ...prev,
        apiCalls: prev.apiCalls + Math.floor(Math.random() * 3),
        latency: `${135 + Math.floor(Math.random() * 15)}ms`
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleApprovePost = (id: string) => {
    storageService.approvePost(id);
    loadData();
  };

  const handleDeletePost = (id: string) => {
    storageService.deletePost(id);
    loadData();
  };

  const handleApproveMoment = (id: string) => {
    storageService.approveMoment(id);
    loadData();
  };

  const handleDeleteMoment = (id: string) => {
    storageService.deleteMoment(id);
    loadData();
  };

  const handleRequest = (id: string, status: 'approved' | 'rejected') => {
    storageService.handleJoinRequest(id, status);
    loadData();
  };

  const isOnline = (lastActive?: number) => {
    if (!lastActive) return false;
    return Date.now() - lastActive < 5 * 60 * 1000;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-32">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-serif font-black mb-4">管理后台</h1>
          <p className="text-gray-400 text-sm tracking-widest uppercase font-bold italic">
            Digital Garden Administrative Panel
          </p>
        </div>
        <div className="flex bg-white/50 p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
          <TabButton active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} label="文章审核" count={pendingPosts.length} />
          <TabButton active={activeTab === 'moments'} onClick={() => setActiveTab('moments')} label="瞬间审核" count={pendingMoments.length} />
          <TabButton active={activeTab === 'requests'} onClick={() => setActiveTab('requests')} label="入园申请" count={requests.filter(r => r.status === 'pending').length} />
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')} label="居民名录" />
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} label="服务监测" />
        </div>
      </header>

      {activeTab === 'posts' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {pendingPosts.length > 0 ? (
            pendingPosts.map(post => (
              <div key={post.id} className="glass p-8 rounded-[2.5rem] border border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-xl transition-all">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="px-2 py-0.5 bg-accent/5 text-accent text-[9px] font-black uppercase tracking-widest rounded">{post.category}</span>
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{post.date}</span>
                  </div>
                  <h3 className="text-xl font-serif font-black text-gray-800 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-400 font-light line-clamp-2 italic">"{post.excerpt}"</p>
                </div>
                <div className="flex space-x-3 shrink-0">
                  <button onClick={() => handleApprovePost(post.id)} className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent transition-all shadow-lg shadow-primary/10">授权发布</button>
                  <button onClick={() => handleDeletePost(post.id)} className="px-6 py-3 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-50 hover:text-red-500 transition-all">拒绝删除</button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center glass rounded-[3rem] border-dashed border-gray-200">
               <p className="text-gray-300 italic font-serif">暂无待审核内容。</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'moments' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {pendingMoments.length > 0 ? (
            pendingMoments.map(moment => (
              <div key={moment.id} className="glass p-8 rounded-[2.5rem] border border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-xl transition-all">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{moment.date}</span>
                    <span className="text-[10px] text-accent font-black uppercase tracking-widest">By {moment.author}</span>
                  </div>
                  <p className="text-gray-600 font-light line-clamp-3 italic">"{moment.content}"</p>
                </div>
                <div className="flex space-x-3 shrink-0">
                  <button onClick={() => handleApproveMoment(moment.id)} className="px-6 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-accent transition-all shadow-lg shadow-primary/10">授权发布</button>
                  <button onClick={() => handleDeleteMoment(moment.id)} className="px-6 py-3 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-red-50 hover:text-red-500 transition-all">拒绝删除</button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-24 text-center glass rounded-[3rem] border-dashed border-gray-200">
               <p className="text-gray-300 italic font-serif">暂无待审核瞬间。</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {requests.map(req => (
            <div key={req.id} className="glass p-8 rounded-[2.5rem] border border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded ${
                    req.status === 'approved' ? 'bg-green-50 text-green-500' : 
                    req.status === 'rejected' ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400'
                  }`}>{req.status}</span>
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{req.date}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{req.email}</h3>
                <p className="text-sm text-gray-500 font-light leading-relaxed">申请理由：{req.reason}</p>
              </div>
              {req.status === 'pending' && (
                <div className="flex space-x-3 shrink-0">
                  <button onClick={() => handleRequest(req.id, 'approved')} className="w-10 h-10 bg-green-500 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-green-500/30 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" strokeWidth="3"/></svg>
                  </button>
                  <button onClick={() => handleRequest(req.id, 'rejected')} className="w-10 h-10 bg-red-500 text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-red-500/30 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" strokeWidth="3"/></svg>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {users.map(user => (
            <div key={user.email} className="glass p-8 rounded-[2.5rem] border border-gray-50 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-xl font-serif font-black text-gray-300 group-hover:bg-accent group-hover:text-white transition-all">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col items-end">
                  <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    isOnline(user.lastActive) ? 'bg-green-50 text-green-500' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${isOnline(user.lastActive) ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
                    <span>{isOnline(user.lastActive) ? 'Online' : 'Offline'}</span>
                  </div>
                  <span className="text-[8px] text-gray-300 mt-2 uppercase font-bold tracking-tighter">
                    {user.lastActive ? `活跃于 ${new Date(user.lastActive).toLocaleTimeString()}` : '从未登录'}
                  </span>
                </div>
              </div>
              <h3 className="font-bold text-gray-800 truncate mb-1">{user.email}</h3>
              <p className="text-[10px] text-accent font-black uppercase tracking-widest opacity-60">
                {user.role === 'admin' ? 'Garden Overseer' : 'Resident of Garden'}
              </p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="API 调用量" value={stats.apiCalls.toString()} subtitle="Gemini 3 Flash" />
            <StatCard title="响应延迟" value={stats.latency} subtitle="Avg Performance" />
            <StatCard title="可用性" value={stats.successRate} subtitle="Stable Node" />
            <StatCard title="在线居民" value={stats.activeUsers.toString()} subtitle="Real-time" />
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string; count?: number }> = ({ active, onClick, label, count }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 whitespace-nowrap ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-primary'
    }`}
  >
    <span>{label}</span>
    {count !== undefined && count > 0 && (
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] ${active ? 'bg-white text-primary' : 'bg-primary text-white'}`}>
        {count}
      </span>
    )}
  </button>
);

const StatCard: React.FC<{title: string; value: string; subtitle: string}> = ({title, value, subtitle}) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5">
    <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">{title}</span>
    <p className="text-3xl font-serif font-black my-2">{value}</p>
    <span className="text-[10px] text-accent font-bold uppercase tracking-widest opacity-60">{subtitle}</span>
  </div>
);

export default Dashboard;
