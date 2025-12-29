
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../services/storage';

interface LoginProps {
  onLogin: (email: string, role?: 'admin' | 'user') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'apply' | 'forgot'>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [reason, setReason] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // 倒计时逻辑
  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (mode === 'apply') {
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      setIsSubmitting(true);
      storageService.submitJoinRequest(email, reason, password);
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setMode('login');
            setReason('');
            setPassword('');
            setConfirmPassword('');
        }, 3000);
      }, 1500);
    } else if (mode === 'forgot') {
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
      setIsSubmitting(true);
      const result = storageService.resetUserPassword(email, code, password);
      setTimeout(() => {
        if (result.success) {
          setMessage(result.message);
          setTimeout(() => {
            setMode('login');
            setPassword('');
            setConfirmPassword('');
            setCode('');
            setIsSubmitting(false);
          }, 2000);
        } else {
          setError(result.message);
          setIsSubmitting(false);
        }
      }, 1000);
    } else {
      const users = storageService.getUsers();
      const user = users.find((u: any) => u.email === email && u.password === password);

      if (user) {
        storageService.updateUserActivity(email);
        onLogin(email, user.role);
        navigate(user.role === 'admin' ? '/dashboard' : '/');
      } else {
        setError('邮箱或密码错误，请重试');
      }
    }
  };

  const handleSendCode = async () => {
    if (!email) {
      setError('请输入邮箱以获取验证码');
      return;
    }
    if (countdown > 0) return;

    setError('');
    setIsSendingCode(true);
    setMessage('正在发送加密验证邮件...');

    const result = await storageService.sendVerificationCode(email);
    
    setIsSendingCode(false);
    if (result.success) {
      setMessage('验证码已发送至您的收件箱，请查收');
      setCountdown(60); // 开启 60 秒倒计时
    } else {
      setError(result.message || '发送失败，请检查邮箱配置');
      setMessage('');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <div className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl shadow-black/5 border border-gray-50 flex flex-col items-center relative overflow-hidden min-h-[550px] justify-center">
        
        {isSuccess ? (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h3 className="text-2xl font-serif font-black mb-2">已收录申请</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest leading-relaxed text-center">
              林间的主人审批通过后<br/>
              您即可使用填写的账号登录
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 bg-accent/10 rounded-3xl flex items-center justify-center mb-8 relative z-10 transition-transform duration-500 hover:rotate-12">
              {mode === 'apply' ? (
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
              ) : mode === 'forgot' ? (
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
              ) : (
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              )}
            </div>
            
            <h2 className="text-3xl font-serif font-black mb-2 text-center animate-in fade-in duration-500">
              {mode === 'apply' ? '申请入园' : mode === 'forgot' ? '找回思绪' : '欢迎回访'}
            </h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 mb-10 text-center">
              {mode === 'apply' ? 'Create your garden identity' : mode === 'forgot' ? 'Reset your garden key' : 'Sign in to your digital garden'}
            </p>

            {error && <p className="mb-6 text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">{error}</p>}
            {message && <p className="mb-6 text-[10px] font-bold text-green-500 uppercase tracking-widest text-center animate-pulse">{message}</p>}

            <form onSubmit={handleSubmit} className="w-full space-y-5 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none"
                  required
                />
              </div>
              
              {mode === 'forgot' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">验证码</label>
                  <div className="flex space-x-2">
                    <input 
                      type="text" value={code} onChange={(e) => setCode(e.target.value)}
                      placeholder="6位验证码"
                      className="flex-1 bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none"
                      required
                    />
                    <button 
                      type="button" onClick={handleSendCode}
                      disabled={isSendingCode || countdown > 0}
                      className="min-w-[100px] px-4 bg-accent/5 text-accent text-[9px] font-black uppercase tracking-widest rounded-2xl hover:bg-accent hover:text-white transition-all disabled:opacity-50 flex items-center justify-center"
                    >
                      {isSendingCode ? (
                        <div className="w-3 h-3 border-2 border-accent/30 border-t-accent rounded-full animate-spin"></div>
                      ) : (
                        <span>{countdown > 0 ? `${countdown}s` : '获取代码'}</span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  {mode === 'login' ? 'Password' : '设置密码'}
                </label>
                <input 
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none"
                  required
                />
              </div>

              {(mode === 'forgot' || mode === 'apply') && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">确认密码</label>
                  <input 
                    type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none"
                    required
                  />
                </div>
              )}

              {mode === 'apply' && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-300">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">申请理由</label>
                  <textarea 
                    value={reason} onChange={(e) => setReason(e.target.value)}
                    placeholder="你想在这里播种什么？"
                    className="w-full bg-gray-50/50 border border-transparent rounded-2xl py-4 px-6 text-sm focus:ring-2 focus:ring-accent/20 focus:bg-white transition-all outline-none resize-none"
                    rows={3} required
                  />
                </div>
              )}

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:bg-accent transition-all duration-500 transform active:scale-95 flex justify-center items-center space-x-2"
              >
                {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <span>{mode === 'apply' ? '提交申请' : mode === 'forgot' ? '确认重置' : '进入花园'}</span>
                )}
              </button>
            </form>

            <div className="mt-8 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setMode(mode === 'login' ? 'apply' : 'login')}
                  className="text-xs text-gray-300 hover:text-accent transition-colors"
                >
                  {mode === 'apply' ? (
                    <span>已有钥匙？<span className="font-bold ml-1 text-gray-500">立即登录</span></span>
                  ) : (
                    <span>还没有钥匙？<span className="font-bold ml-1 text-gray-500">申请入园</span></span>
                  )}
                </button>
                {mode === 'login' && (
                  <>
                    <span className="text-gray-100 text-[10px]">|</span>
                    <button 
                      onClick={() => setMode('forgot')}
                      className="text-xs text-gray-300 hover:text-accent transition-colors"
                    >
                      忘记密码？
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
