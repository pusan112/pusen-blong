// src/index.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App"; // 引入主应用组件
import { AuthProvider } from "./AuthProvider"; // 引入 AuthProvider（从 src/AuthProvider.tsx）

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>  {/* 用 AuthProvider 包裹整个应用 */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
