import { Link, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

interface NavigationProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isLoggedIn, isAdmin, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
      navigate('/');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'py-4 glass shadow-sm' : 'py-8 bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-8 flex justify-between items-center">
        <Link to="/" className="group flex items-center space-x-3">
          <div className="w-10 h-10 bg-black rounded-2xl flex items-center justify-center text-white font-serif font-black transition-transform group-hover:rotate-12">P</div>
          <div className="flex flex-col">
            <h1 className="text-xl font-serif font-black tracking-tighter">
              PUSEN
            </h1>
            <p className="text-[8px] uppercase tracking-[0.3em] text-gray-400">POETIZE GARDEN</p>
          </div>
        </Link>
        
        <div className="hidden lg:flex items-center bg-white/40 backdrop-blur-md rounded-full px-2 py-1 border border-white/40 shadow-sm">
          <NavLink to="/" active={isActive('/')} label="首页" />
          <NavLink to="/moments" active={isActive('/moments')} label="瞬间" />
          {/* 仅登录可见 */}
          {isLoggedIn && <NavLink to="/radio" active={isActive('/radio')} label="电台" />}
          {isLoggedIn && <NavLink to="/cinema" active={isActive('/cinema')} label="影院" />}
          <NavLink to="/archive" active={isActive('/archive')} label="存档" />
          {isAdmin && <NavLink to="/dashboard" active={isActive('/dashboard')} label="控制台" />}
          <NavLink to="/about" active={isActive('/about')} label="关于" />
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn && (
            <>
              <Link to="/settings" className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:border-accent transition-all group" title="账户设置">
                <svg className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
              <button 
                onClick={handleLogoutClick}
                className="w-10 h-10 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:border-red-200 hover:bg-red-50 transition-all group" 
                title="退出登录"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </>
          )}
          {isLoggedIn ? (
            <Link to="/write" className="w-10 h-10 bg-accent text-white rounded-2xl flex items-center justify-center hover:shadow-lg hover:shadow-accent/30 transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
            </Link>
          ) : (
            <Link to="/login" className="text-[10px] font-black uppercase tracking-widest px-6 py-2.5 bg-white rounded-full border border-gray-100 hover:border-accent transition-all">
              Entry
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink: React.FC<{ to: string; active: boolean; label: string }> = ({ to, active, label }) => (
  <Link to={to} className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
    active ? 'bg-white text-accent shadow-sm' : 'text-gray-500 hover:text-black'
  }`}>
    {label}
  </Link>
);

export default Navigation;