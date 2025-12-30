// src/AuthProvider.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabaseClient } from "./services/supabaseClient";
import { AuthProvider } from './AuthProvider';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化时获取当前会话
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (!mounted) return;
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    init();

    // 监听 auth 状态变化（登录/登出/刷新）
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      throw error;
    }
    setSession(data.session);
    setUser(data.session?.user ?? null);
  };

  const signUp = async (email: string, password: string) => {
    setError(null);
    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      throw error;
    }
    setSession(data.session ?? null);
    setUser(data.session?.user ?? null);
  };

  const signOut = async () => {
    setError(null);
    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      setError(error.message);
      throw error;
    }
    setSession(null);
    setUser(null);
  };

  const value: AuthContextValue = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 方便在组件里直接 useAuth()
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth 必须在 <AuthProvider> 内部使用");
  }
  return ctx;
};
