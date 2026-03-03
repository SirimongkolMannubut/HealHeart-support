"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Shield, Info, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { usePosts } from '@/hooks';
import { CATEGORIES, containsSelfHarm } from '@/lib/utils';
import { getAnonymousId } from '@/types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

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

export default function CreatePostPage() {
  const router = useRouter();
  const { createPost } = usePosts();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [showWarning, setShowWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    // AI Moderation
    const moderationRes = await fetch('/api/moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `${title} ${content}` }),
    });
    const moderation = await moderationRes.json();
    
    if (moderation.flagged) {
      alert('เนื้อหาของคุณไม่เหมาะสม กรุณาแก้ไขก่อนโพสต์');
      return;
    }
    
    await createPost(title, content, category);
    router.push('/');
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);
    setShowWarning(containsSelfHarm(val) || containsSelfHarm(title));
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="mb-6 flex items-center gap-2">
          <button type="button" title="Go back" onClick={() => router.back()} className="p-2 hover:bg-orange-50 rounded-full transition-colors">
            <ChevronRight className="rotate-180" size={24} />
          </button>
          <h2 className="text-2xl font-bold text-slate-800">ระบายความในใจ</h2>
        </div>

        <AnimatePresence>
          {showWarning && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-rose-50 border border-rose-100 p-4 rounded-2xl mb-6 flex gap-3"
            >
              <div className="text-rose-500 shrink-0"><Info size={24} /></div>
              <div>
                <p className="text-rose-800 font-bold text-sm mb-1">เราเป็นห่วงคุณนะ</p>
                <p className="text-rose-700 text-xs leading-relaxed">
                  หากคุณรู้สึกไม่ไหว หรือมีความคิดอยากทำร้ายตัวเอง เราอยากให้คุณลองคุยกับใครสักคน 
                  สายด่วนสุขภาพจิต <span className="font-bold">1323</span> พร้อมรับฟังคุณตลอด 24 ชม.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-[2rem]">
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">หมวดหมู่</label>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map((cat: string) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full text-xs font-medium transition-all",
                    category === cat ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-600 hover:bg-orange-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">หัวข้อ</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="สรุปปัญหาของคุณสั้นๆ"
              className="w-full px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              required
            />
          </div>

          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-2">รายละเอียด</label>
            <textarea 
              value={content}
              onChange={handleContentChange}
              placeholder="เล่าเรื่องราวที่คุณอยากระบาย..."
              className="w-full h-48 px-4 py-3 rounded-xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
              required
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg hover:bg-orange-600 transition-all active:scale-[0.98]"
          >
            โพสต์ข้อความ
          </button>
        </form>
      </div>
      <footer className="py-12 text-center text-slate-400 text-xs">
        <p>© 2024 HealHeart. พื้นที่ปลอดภัยสำหรับทุกคน</p>
        <p className="mt-2">หากต้องการความช่วยเหลือเร่งด่วน ติดต่อสายด่วนสุขภาพจิต 1323</p>
      </footer>
    </div>
  );
}
