
// Add React import to fix 'Cannot find namespace React' error
import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PUSEN | 数字花园",
  description: "一个记录生活、设计思考与代码点滴的个人空间。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased overflow-x-hidden bg-[#fdfcfb]">
        {children}
        
        {/* EmailJS SDK */}
        <Script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js" strategy="afterInteractive" />
        <Script id="emailjs-init" strategy="afterInteractive">
          {`
            (function() {
              if (window.emailjs) window.emailjs.init("GHt5-xrX-YHyMants");
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
