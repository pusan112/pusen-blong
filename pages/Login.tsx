import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthProvider';

interface LoginProps {
  onLogin: (email: string, role: 'admin' | 'user') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      await signIn(email, password);
      onLogin(email, role);
      navigate("/");  // 跳转到首页
    } catch (err) {
      setError("登录失败，请检查您的邮箱和密码");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">登录</h2>
        <div className="mt-6">
          <label htmlFor="email" className="block text-sm font-medium">邮箱</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mt-2 border rounded-lg"
            placeholder="you@example.com"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="password" className="block text-sm font-medium">密码</label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mt-2 border rounded-lg"
            placeholder="密码"
          />
        </div>
        <div className="mt-4">
          <label htmlFor="role" className="block text-sm font-medium">角色</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'user')}
            className="w-full p-3 mt-2 border rounded-lg"
          >
            <option value="user">用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
        <button
          type="submit"
          className="w-full mt-6 p-3 bg-accent text-white rounded-full"
        >
          登录
        </button>
      </form>
    </div>
  );
};

export default Login;
