// pages/WritePost.tsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogService } from "../services/ai-client";
import { storageService } from "../services/storageService";
import { Post } from "../types";
import { useAuth } from "../AuthProvider";

const WritePost: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topic, setTopic] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // 自动高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [content]);

  const handleAIDraft = async () => {
    if (!topic || isGenerating) return;
    setIsGenerating(true);
    try {
      const draft = await blogService.generateDraft(topic);
      if (draft.includes("\n")) {
        const lines = draft.split("\n");
        setTitle(lines[0].replace(/[#*]/g, "").trim());
        setContent(lines.slice(1).join("\n").trim());
      } else {
        setContent(draft);
      }
      const suggestedTags = await blogService.generateTags(draft);
      setTags(suggestedTags);
    } catch (err) {
      console.error(err);
      alert("AI 写作助手暂时休息了。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawText = event.target?.result as string;
      if (!rawText) return;

      let parsedTitle = file.name.replace(/\.(md|txt|markdown)$/i, "");
      let parsedContent = rawText;

      const h1Match = rawText.match(/^#\s+(.*)$/m);
      if (h1Match) {
        parsedTitle = h1Match[1].trim();
        parsedContent = rawText.replace(h1Match[0], "").trim();
      }

      setTitle(parsedTitle);
      setContent(parsedContent);

      if (parsedContent.length > 50) {
        setIsGenerating(true);
        try {
          const suggested = await blogService.generateTags(parsedContent);
          setTags(suggested);
        } catch (err) {
          console.error("Tag generation failed", err);
        } finally {
          setIsGenerating(false);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCoverImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePolish = async () => {
    if (!content || isPolishing) return;
    setIsPolishing(true);
    try {
      const polished = await blogService.polishContent(content);
      setContent(polished);
    } catch (err) {
      alert("润色失败，请稍后再试。");
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSuggestTags = async () => {
    if (!content || isGenerating) return;
    setIsGenerating(true);
    try {
      const suggested = await blogService.generateTags(content);
      setTags(Array.from(new Set([...tags, ...suggested])));
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleArchive = async () => {
    if (!title || !content) {
      alert("请至少填写标题和内容。");
      return;
    }

    setIsArchiving(true);

    try {
      const newPost: Omit<Post, "id"> = {
        title,
        excerpt: content.slice(0, 100).replace(/\n/g, " ") + "...",
        content,
        author: user?.email || "匿名园丁",
        date: new Date().toISOString().split("T")[0],
        category: "感悟",
        tags,
        coverImage:
          coverImage ||
          `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&sig=${Date.now()}`,
        readTime: `${Math.max(1, Math.ceil(content.length / 300))} min`,
      };

      await storageService.savePost(newPost);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("保存失败，请稍后再试");
    } finally {
      setIsArchiving(false);
    }
  };

  // ======== UI 保持你原来的风格 ========
  // 下方内容基本不动，只把内部逻辑换成上面的函数
  return (
    <div className="min-h-screen bg-[#fdfcfb] pt-32 pb-24 px-6 relative">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".md,.txt,.markdown"
        onChange={handleFileUpload}
      />
      <input
        type="file"
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleCoverUpload}
      />

      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12">
        {/* 左侧编辑区（省略 UI 注释，保持不变） */}
        {/* ... 这里直接用你原来的 JSX 结构，只是事件处理我已经调成上面的函数 ... */}
        {/* 为了不刷太长，这里就不重复你整段 JSX 了，如果你希望我把这一页完整 + 注释版全部展开，我也可以再发一版专门只给 WritePost.tsx 的 UI。 */}
      </div>
    </div>
  );
};

export default WritePost;
