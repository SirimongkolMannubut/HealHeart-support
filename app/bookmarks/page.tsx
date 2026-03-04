"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, Shield, Bookmark, ChevronRight } from 'lucide-react';
import { usePosts } from '@/hooks';
import { getAnonymousId, getBookmarkedPosts, toggleBookmark, getUserRole } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function timeAgo(date: any): string {
  if (!date) return 'เมื่อสักครู่';
  const d = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'เมื่อสักครู่';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} วันที่แล้ว`;
  const months = Math.floor(days / 30);
  return `${months} เดือนที่แล้ว`;
}

const Navbar = () => {
  const [anonId, setAnonId] = useState('');
  const [userRole, setUserRole] = useState('');
  
  useEffect(() => {
    setAnonId(getAnonymousId());
    getUserRole().then(role => setUserRole(role || ''));
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass-card px-4 py-3 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <Heart fill="currentColor" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">HealHeart</h1>
            <span className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Anonymous Support</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/bookmarks" className="text-amber-500 hover:text-amber-600 transition-colors">
            <Bookmark size={20} />
          </Link>
          <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
            <Shield size={20} />
          </Link>
          <div className="flex flex-col items-end">
            <div className="px-3 py-1 bg-orange-100 rounded-full text-orange-700 text-xs font-medium">
              {anonId}
            </div>
            {userRole && (
              <span className="text-[10px] text-slate-500 mt-1">{userRole}</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function BookmarksPage() {
  const router = useRouter();
  const { posts } = usePosts();
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    setBookmarkedIds(getBookmarkedPosts());
  }, []);

  const bookmarkedPosts = useMemo(() => 
    posts.filter(p => bookmarkedIds.includes(p.id)),
    [posts, bookmarkedIds]
  );

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="mb-6 flex items-center gap-2">
          <button onClick={() => router.back()} className="p-2 hover:bg-orange-50 rounded-full">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bookmark className="text-amber-500" fill="currentColor" />
            โพสต์ที่บันทึกไว้
          </h2>
        </div>

        {bookmarkedPosts.length > 0 ? (
          bookmarkedPosts.map(post => (
            <div key={post.id} className="glass-card p-6 rounded-3xl mb-4">
              <Link href={`/post/${post.id}`}>
                <div className="cursor-pointer group">
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 bg-white border border-orange-100 rounded-full text-orange-600 text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-slate-400 text-xs">{timeAgo(post.createdAt)}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-600">{post.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4">{post.content}</p>
                </div>
              </Link>
              <div className="flex items-center justify-between pt-4 border-t border-orange-50">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Heart size={18} />
                  <span className="text-sm font-medium">{post.likes || 0}</span>
                </div>
                <button
                  onClick={() => {
                    toggleBookmark(post.id);
                    setBookmarkedIds(getBookmarkedPosts());
                  }}
                  className="p-2 text-amber-500 hover:text-amber-600"
                >
                  <Bookmark size={16} fill="currentColor" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 glass-card rounded-3xl">
            <Bookmark size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400">ยังไม่มีโพสต์ที่บันทึกไว้</p>
          </div>
        )}
      </div>
    </div>
  );
}
