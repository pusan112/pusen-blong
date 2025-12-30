// pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";

interface LoginProps {
  onLogin: (email: string, role: "admin" | "user") => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const { signIn, signUp, error, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const isAdmin = (email: string) => {
    // 这里你可以按自己习惯判断管理员
    // 比如固定某个邮箱是 admin
    return email === "admin@pusen.garden";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      if (mode === "login") {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      const role = isAdmin(email) ? "admin" : "user";
      onLogin(email, role);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 flex items-center justify-center bg-bgWarm">
      <div className="max-w-md w-full glass rounded-3xl p-10 border border-accent/10 shadow-xl">
        <div className="mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-3">
            {mode === "login" ? "欢迎回来" : "加入花园"}
          </p>
          <h1 className="text-3xl font-serif font-black">PUSEN 数字花园</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              邮箱
            </label>
            <input
              type="email"
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-white/80 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 tracking-widest uppercase">
              密码
            </label>
            <input
              type="password"
              className="mt-2 w-full px-4 py-3 rounded-2xl bg-white/80 border border-gray-100 focus:outline-none focus:ring-2 focus:ring-accent/40 text-sm"
              placeholder="至少 6 位字符"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 px-6 py-3 rounded-full bg-primary text-white text-xs font-black tracking-[0.3em] uppercase hover:bg-accent transition-all disabled:opacity-50"
          >
            {loading
              ? "处理中..."
              : mode === "login"
              ? "登录到花园"
              : "注册并进入花园"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-[11px] text-gray-400 hover:text-accent transition-colors"
            onClick={() =>
              setMode(mode === "login" ? "register" : "login")
            }
          >
            {mode === "login"
              ? "还没有账号？点击这里注册"
              : "已经有账号？点击这里登录"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
