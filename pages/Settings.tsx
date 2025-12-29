
import React, { useState } from 'react';
import { storageService } from '../services/storage';

interface SettingsProps {
  role: 'admin' | 'user';
  email: string;
}

const Settings: React.FC<SettingsProps> = ({ role, email }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showCodeInput, setShowCodeInput] = useState(role === 'user');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ text: '两次输入的密码不一致', type: 'error' });
      return;
    }

    if (role === 'admin') {
      storageService.updateAdminPassword(password);
      setMessage({ text: '管理员密码更新成功', type: 'success' });
    } else {
      const result = storageService.resetUserPassword(email, code, password);
      setMessage({ text: result.message, type: result.success ? 'success' : 'error' });
    }
  };

  const handleSendCode = () => {
    setIsSendingCode(true);
    const generatedCode = storageService.sendVerificationCode(email);
    setTimeout(() => {
      setIsSendingCode(false);
      alert(`[数字花园] 您的验证码是：${generatedCode} (已发送至您的模拟邮箱)`);
      setMessage({ text: '验证码已发送，请查看邮箱', type: 'info' });
    }, 1000);
  };

  return (
    <div className="max-w-xl mx-auto px-6 py-32">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl shadow-black/5 border border-gray-50">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-serif font-black mb-2">账户设置</h1>
          <p className="text-[10px] uppercase tracking-widest text-gray-300">
            {role === 'admin' ? 'Security Control Center' : 'Update your credentials'}
          </p>
        </header>

        {message.text && (
          <div className={`mb-8 p-4 rounded-2xl text-xs font-bold text-center ${
            message.type === 'error' ? 'bg-red-50 text-red-500' : 
            message.type === 'success' ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">当前账号</label>
            <div className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 px-6 text-sm text-gray-400 font-medium">
              {email}
            </div>
          </div>

          {role === 'user' && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">安全验证</label>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  placeholder="输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="flex-1 bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none"
                  required={role === 'user'}
                />
                <button 
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSendingCode}
                  className="px-6 bg-accent/5 text-accent text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-accent hover:text-white transition-all disabled:opacity-50"
                >
                  {isSendingCode ? '发送中...' : '发送代码'}
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">新密码</label>
            <input 
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">确认新密码</label>
            <input 
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-accent transition-all duration-500 transform active:scale-95"
          >
            保存修改
          </button>
        </form>

        <p className="mt-8 text-[9px] text-gray-300 text-center italic">
          {role === 'admin' ? '作为管理员，您可以直接更新您的安全凭据。' : '出于安全考虑，普通用户修改密码需要验证注册邮箱。'}
        </p>
      </div>
    </div>
  );
};

export default Settings;
