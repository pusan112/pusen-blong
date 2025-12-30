// pages/Login.tsx
import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

const Login: React.FC = () => {
  const { user, loading, error, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // 如果已经登录，直接回首页
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError(null);
    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate("/", { replace: true });
    } catch (err: any) {
      setLocalError(err?.message ?? "操作失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcfb] flex items-center justify-center px-6">
      <div className="max-w-md w-full glass rounded-[2.5rem] border border-accent/10 shadow-2xl p-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-40 h-40 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

        <div className="mb-8 text-center">
          <div className="inline-block px-4 py-1.5 glass rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-4">
            Digital Garden
          </div>
          <h1 className="text-2xl font-serif font-black mb-2">
            {mode === "login" ? "回到花园" : "种下新身份"}
          </h1>
          <p className="text-xs text-gray-400">
            {mode === "login"
              ? "用你的园丁身份登录，继续打理花园。"
              : "注册一个新园丁账号，开始栽种你的思绪。"}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              邮箱
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-100 bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              密码
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-100 bg-white/70 focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
              placeholder="至少 6 位字符"
            />
          </div>

          {(error || localError) && (
            <div className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-2xl px-3 py-2">
              {localError || error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 px-4 py-3 bg-primary text-white rounded-full text-xs font-bold tracking-[0.25em] uppercase hover:bg-accent transition-all flex items-center justify-center space-x-2 disabled:opacity-40"
          >
            {submitting && (
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>
              {mode === "login" ? "登录花园" : "注册并进入花园"}
            </span>
          </button>
        </form>

        <div className="mt-6 text-center text-[11px] text-gray-400">
          {mode === "login" ? (
            <>
              还没有园丁身份？{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-accent font-semibold hover:underline"
              >
                立即注册
              </button>
            </>
          ) : (
            <>
              已经有账号？{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-accent font-semibold hover:underline"
              >
                去登录
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
