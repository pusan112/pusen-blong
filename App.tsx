import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import PostDetail from './pages/PostDetail';
import WritePost from './pages/WritePost';
import Archive from './pages/Archive';
import About from './pages/About';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Moments from './pages/Moments';
import Radio from './pages/Radio';
import Cinema from './pages/Cinema';
import Settings from './pages/Settings';
import MusicPlayer from './components/MusicPlayer';
import DanmakuOverlay from './components/DanmakuOverlay';
import StickmanFollower from './components/StickmanFollower';
import { storageService } from './services/storage';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string>('');

  const handleLogin = (email: string, role: 'admin' | 'user' = 'user') => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentUserEmail(email);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentUserEmail('');
  };

  // 用户活跃度心跳机制
  useEffect(() => {
    if (isLoggedIn && currentUserEmail) {
      const interval = setInterval(() => {
        storageService.updateUserActivity(currentUserEmail);
      }, 60000); // 每分钟发送一次心跳
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, currentUserEmail]);

  return (
    <Router>
      <div className="min-h-screen bg-bgWarm font-sans selection:bg-accent/20 selection:text-accent relative pb-24">
        <Navigation 
          isLoggedIn={isLoggedIn} 
          isAdmin={userRole === 'admin'} 
          onLogout={handleLogout} 
        />
        <main>
          <Routes>
            <Route path="/" element={<Home isAdmin={userRole === 'admin'} />} />
            <Route path="/moments" element={<Moments isAdmin={userRole === 'admin'} />} />
            {/* 需要登录的路由 */}
            <Route path="/radio" element={isLoggedIn ? <Radio /> : <Navigate to="/login" />} />
            <Route path="/cinema" element={isLoggedIn ? <Cinema /> : <Navigate to="/login" />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/write" element={<WritePost />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/dashboard" 
              element={userRole === 'admin' ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={isLoggedIn ? <Settings role={userRole || 'user'} email={currentUserEmail} /> : <Navigate to="/login" />} 
            />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
          </Routes>
        </main>
        
        < DanmakuOverlay />
        <MusicPlayer />
        <StickmanFollower />

        <footer className="py-24 border-t border-gray-100/50">
          <div className="max-w-6xl mx-auto px-8 text-center space-y-10">
            <div className="flex flex-col items-center">
              <p className="text-3xl font-serif font-black tracking-tight opacity-20">PUSEN</p>
              <div className="w-12 h-0.5 bg-gray-100 mt-4"></div>
            </div>
            <p className="text-[10px] text-gray-300 tracking-[0.4em] uppercase font-bold">© 2024 PUSEN Digital Garden. Handcrafted with Love.</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;