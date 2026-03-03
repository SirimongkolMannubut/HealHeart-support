"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Shield, Trash2, CheckCircle } from 'lucide-react';
import { usePosts } from '@/hooks';
import { getAnonymousId } from '@/types';
import Link from 'next/link';

const Navbar = () => {
  const [anonId, setAnonId] = useState('');
  
  useEffect(() => {
    setAnonId(getAnonymousId());
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass-card px-4 py-3 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform">
            <Heart fill="currentColor" size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-slate-800 leading-none">HealHeart</h1>
            <span className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Anonymous Support</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-slate-400 hover:text-slate-600 transition-colors">
            <Shield size={20} />
          </Link>
          <div className="px-3 py-1 bg-orange-100 rounded-full text-orange-700 text-xs font-medium">
            {anonId}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default function AdminPage() {
  const { posts, deletePost } = usePosts();
  const [filter, setFilter] = useState<'reported' | 'resolved'>('reported');
  
  const reportedPosts = posts.filter((p: any) => (p.reportCount ?? 0) > 0 && !p.isResolved)
    .sort((a: any, b: any) => (b.reportCount ?? 0) - (a.reportCount ?? 0));
  
  const resolvedPosts = posts.filter((p: any) => p.isResolved);
  
  const displayPosts = filter === 'reported' ? reportedPosts : resolvedPosts;

  const handleDelete = async (postId: string) => {
    if (confirm('ต้องการลบโพสต์นี้หรือไม่?')) {
      await deletePost(postId);
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Shield className="text-amber-500" />
          Admin Panel
        </h2>
        
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('reported')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'reported' ? 'bg-amber-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            โพสต์ถูกรายงาน ({reportedPosts.length})
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === 'resolved' ? 'bg-green-500 text-white' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            จัดการแล้ว ({resolvedPosts.length})
          </button>
        </div>
        
        <div className="grid gap-4">
          {displayPosts.map((post: any) => (
            <div key={post.id} className={`bg-white p-6 rounded-2xl border-2 shadow-sm ${
              post.isResolved ? 'border-green-100' : 'border-amber-100'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  {post.isResolved ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <CheckCircle size={14} /> จัดการแล้ว
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">
                      รายงาน: {post.reportCount}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs">
                    {post.category}
                  </span>
                </div>
                {!post.isResolved && (
                  <button 
                    onClick={() => handleDelete(post.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-rose-500 text-white rounded-full text-xs font-bold hover:bg-rose-600 transition-all"
                  >
                    <Trash2 size={14} /> ลบโพสต์
                  </button>
                )}
              </div>
              <h3 className="font-bold mb-2 text-slate-800">{post.title}</h3>
              <p className="text-slate-600 text-sm mb-3">{post.content}</p>
              <div className="text-xs text-slate-400">
                โดย: {post.authorId} | ไลค์: {post.likes || 0}
              </div>
            </div>
          ))}
          {displayPosts.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              {filter === 'reported' ? 'ยังไม่มีโพสต์ที่ถูกรายงาน' : 'ไม่มีโพสต์ที่จัดการแล้ว'}
            </div>
          )}
        </div>
      </div>
      <footer className="py-12 text-center text-slate-400 text-xs">
        <p>© 2024 HealHeart. พื้นที่ปลอดภัยสำหรับทุกคน</p>
        <p className="mt-2">หากต้องการความช่วยเหลือเร่งด่วน ติดต่อสายด่วนสุขภาพจิต 1323</p>
      </footer>
    </div>
  );
}
