
import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, featured = false }) => {
  const renderTags = (className: string) => (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {post.tags.map(tag => (
        <span key={tag} className="text-[9px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md group-hover:bg-accent/5 group-hover:text-accent transition-colors">
          #{tag}
        </span>
      ))}
    </div>
  );

  const authorBadge = (
    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] flex items-center space-x-1.5">
      <span className="w-4 h-[1px] bg-gray-100"></span>
      <span>{post.author}</span>
    </div>
  );

  if (featured) {
    return (
      <Link to={`/post/${post.id}`} className="group block mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="overflow-hidden rounded-2xl aspect-[16/9] lg:aspect-square bg-gray-100">
            <img 
              src={post.coverImage} 
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold uppercase tracking-widest text-accent">{post.category}</span>
                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                {renderTags("")}
              </div>
              {authorBadge}
            </div>
            <h2 className="text-3xl md:text-5xl font-serif leading-tight group-hover:text-accent transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span className="font-medium text-gray-900">{post.author}</span>
              <span>•</span>
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime} 阅读</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/post/${post.id}`} className="group flex flex-col space-y-4">
      <div className="overflow-hidden rounded-xl aspect-[16/10] bg-gray-100">
        <img 
          src={post.coverImage} 
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{post.category}</span>
          <span className="text-xs text-gray-300 font-medium">{post.readTime}</span>
        </div>
        <h3 className="text-xl font-serif font-bold group-hover:text-accent transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <div className="space-y-2">
          {renderTags("pt-1")}
          {authorBadge}
        </div>
        <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed pt-1">
          {post.excerpt}
        </p>
        <div className="flex items-center space-x-2 text-xs text-gray-400 pt-2">
          <span className="font-medium text-gray-700">{post.author}</span>
          <span>•</span>
          <span>{post.date}</span>
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
