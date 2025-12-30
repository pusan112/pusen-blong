import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { blogService } from "../services/ai-client";
import { storageService } from "../services/storage";
import { Post } from "../types";

const WritePost: React.FC = () => {
  const navigate = useNavigate();
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

  // Auto-resize textarea
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

  // ⭐ 改成真正云端保存
  const handleArchive = async () => {
    if (!title || !content) {
      alert("请至少填写标题和内容。");
      return;
    }

    setIsArchiving(true);

    const newPost: Post = {
      id: `custom-${Date.now()}`,
      title,
      excerpt: content.slice(0, 100).replace(/\n/g, " ") + "...",
      content,
      author: "林间",
      date: new Date().toISOString().split("T")[0],
      category: "感悟",
      tags,
      coverImage:
        coverImage ||
        `https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1200&sig=${Date.now()}`,
      readTime: `${Math.max(1, Math.ceil(content.length / 300))} min`,
    };

    try {
      await storageService.savePost(newPost);
      navigate("/");
    } catch (e) {
      console.error(e);
      alert("保存失败，请稍后再试。");
    } finally {
      setIsArchiving(false);
    }
  };

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
        <div className="flex-1 space-y-12 animate-fade-in-up">
          <div className="glass p-6 rounded-[2rem] shadow-sm border border-accent/5 flex flex-col md:flex-row gap-4 items-center">
            <div className="flex items-center space-x-3 shrink-0">
              <div className="w-8 h-8 bg-accent/10 rounded-xl flex items-center justify-center">
                <svg
                  className={`w-4 h-4 text-accent ${
                    isGenerating ? "animate-spin" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                灵感捕捉
              </span>
            </div>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入一个主题，让 AI 帮你起笔..."
              className="flex-1 bg-transparent border-none py-2 focus:ring-0 outline-none text-sm font-medium placeholder:text-gray-200"
              onKeyDown={(e) => e.key === "Enter" && handleAIDraft()}
            />
            <button
              onClick={handleAIDraft}
              disabled={isGenerating || !topic}
              className="px-6 py-2.5 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent transition-all disabled:opacity-30 disabled:hover:bg-primary shadow-lg shadow-black/5"
            >
              {isGenerating ? "思索中" : "生成初稿"}
            </button>
          </div>

          <div className="flex space-x-8 border-b border-gray-100">
            <button
              onClick={() => setActiveTab("edit")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                activeTab === "edit" ? "text-accent" : "text-gray-300"
              }`}
            >
              编写模式
              {activeTab === "edit" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`pb-4 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
                activeTab === "preview" ? "text-accent" : "text-gray-300"
              }`}
            >
              预览模式
              {activeTab === "preview" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"></div>
              )}
            </button>
          </div>

          {activeTab === "edit" ? (
            <div className="space-y-8 min-h-[600px]">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="在这拟一个标题..."
                className="w-full text-4xl md:text-5xl font-serif font-black bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-200 leading-tight"
              />

              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-accent/5 text-accent text-[10px] font-bold rounded-full border border-accent/10 flex items-center group"
                  >
                    #{tag}
                    <button
                      onClick={() =>
                        setTags(tags.filter((_, idx) => idx !== i))
                      }
                      className="ml-2 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M6 18L18 6M6 6l12 12"
                          strokeWidth="2.5"
                        />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="此刻的心境是..."
                className="w-full text-lg font-light leading-[1.8] bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-gray-100 resize-none min-h-[400px]"
              />
            </div>
          ) : (
            <article className="prose prose-stone max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
              {coverImage && (
                <div className="mb-12 rounded-[2rem] overflow-hidden aspect-video shadow-2xl ring-1 ring-black/5">
                  <img
                    src={coverImage}
                    className="w-full h-full object-cover"
                    alt="Cover Preview"
                  />
                </div>
              )}
              <h1 className="font-serif font-black">
                {title || "未命名文章"}
              </h1>
              <div className="flex gap-2 mb-8">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-accent text-xs font-bold"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="whitespace-pre-wrap text-gray-600 leading-[1.8] text-lg font-light">
                {content || "暂无内容..."}
              </div>
            </article>
          )}

          <div className="flex justify-between items-center pt-10 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-[10px] text-gray-300 font-black uppercase tracking-widest">
              <span>Word Count: {content.length}</span>
            </div>
            <button
              onClick={handleArchive}
              disabled={isArchiving || !title || !content}
              className="group relative px-12 py-5 bg-primary text-white rounded-full text-xs font-bold shadow-2xl hover:bg-accent transition-all duration-500 transform hover:-translate-y-1 active:scale-95 shadow-primary/20 flex items-center space-x-3 overflow-hidden"
            >
              {isArchiving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>正在收纳灵感...</span>
                </>
              ) : (
                <>
                  <span>收纳到数字花园</span>
                  <svg
                    className="w-4 h-4 transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>

        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-32 space-y-6">
            <div className="glass p-8 rounded-[2.5rem] border border-accent/5 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-accent"></div>

              <div className="mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-4">
                  封面图设置
                </h3>
                <div
                  onClick={() => coverInputRef.current?.click()}
                  className={`relative aspect-video rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center cursor-pointer hover:border-accent/40 hover:bg-accent/5 transition-all overflow-hidden ${
                    coverImage ? "border-solid" : ""
                  }`}
                >
                  {coverImage ? (
                    <img
                      src={coverImage}
                      className="w-full h-full object-cover"
                      alt="Selected Cover"
                    />
                  ) : (
                    <>
                      <svg
                        className="w-6 h-6 text-gray-200 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-300">
                        上传文章封面
                      </span>
                    </>
                  )}
                  {coverImage && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="text-white text-[9px] font-black uppercase tracking-widest">
                        更换封面
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-8 flex items-center">
                <span className="mr-2">AI Muse</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-accent rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-accent rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </h3>

              <div className="space-y-4">
                <SidebarButton
                  icon="📂"
                  label="导入本地文件"
                  desc="支持 Markdown/TXT 格式"
                  onClick={() => fileInputRef.current?.click()}
                />
                <div className="h-px bg-gray-50 my-2"></div>
                <SidebarButton
                  icon="✨"
                  label="深度润色"
                  desc="优化措辞，提升质感"
                  onClick={handlePolish}
                  loading={isPolishing}
                  disabled={!content}
                />
                <SidebarButton
                  icon="🏷️"
                  label="生成标签"
                  desc="自动提取核心关键词"
                  onClick={handleSuggestTags}
                  loading={isGenerating && content.length > 0}
                  disabled={!content}
                />
                <SidebarButton
                  icon="💡"
                  label="标题建议"
                  desc="生成更具吸引力的标题"
                  onClick={async () => {
                    if (!content) return;
                    setIsGenerating(true);
                    const titles = await blogService.suggestTitles(content);
                    if (titles.length > 0) setTitle(titles[0]);
                    setIsGenerating(false);
                  }}
                  loading={isGenerating && content.length > 0}
                  disabled={!content}
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const SidebarButton: React.FC<{
  icon: string;
  label: string;
  desc: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}> = ({ icon, label, desc, onClick, loading, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    className="w-full text-left p-4 rounded-2xl hover:bg-accent/5 border border-transparent hover:border-accent/10 transition-all group disabled:opacity-30"
  >
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center space-x-3">
        <span className="text-sm">{icon}</span>
        <span className="text-[11px] font-black uppercase tracking-wider text-primary group-hover:text-accent transition-colors">
          {label}
        </span>
      </div>
      {loading && (
        <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
      )}
    </div>
    <p className="text-[9px] text-gray-400 font-medium ml-7">{desc}</p>
  </button>
);

export default WritePost;
