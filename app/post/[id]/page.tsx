"use client";

import React, { useState, useEffect, use } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Send, ChevronRight, Shield } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { usePosts, useComments } from '@/hooks';
import { getAnonymousId, hasLikedPost } from '@/types';
import Link from 'next/link';

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

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { posts, likePost } = usePosts();
  const { comments, addComment } = useComments(id || '');
  const [newComment, setNewComment] = useState('');
  const [liked, setLiked] = useState(false);
  
  const post = posts.find((p: any) => p.id === id);

  useEffect(() => {
    if (post) setLiked(hasLikedPost(post.id));
  }, [post]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await addComment(newComment);
    setNewComment('');
  };

  if (!post) return <div className="text-center py-20">ไม่พบโพสต์นี้</div>;

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-orange-500 transition-colors">
          <ChevronRight className="rotate-180" size={20} />
          <span>กลับ</span>
        </button>

        <div className="glass-card p-8 rounded-[2.5rem] mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                {post.category}
              </span>
              {post.authorRole && post.authorRole !== '' && (
                <span className="text-xs text-slate-500">{post.authorRole}</span>
              )}
            </div>
            <span className="text-slate-400 text-xs">{timeAgo(post.createdAt)}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">{post.title}</h2>
          <p className="text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap">{post.content}</p>
          
          <div className="flex items-center gap-6 pt-6 border-t border-orange-50">
            <button 
              onClick={() => {
                if (!liked) {
                  likePost(post.id);
                  setLiked(true);
                }
              }}
              disabled={liked}
              className={`flex items-center gap-2 transition-colors group ${liked ? 'text-rose-500' : 'text-slate-500 hover:text-rose-500'}`}
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} className="group-hover:fill-rose-500" />
              <span className="font-bold">{post.likes || 0} กำลังใจ</span>
            </button>
            <div className="text-slate-400 text-sm flex items-center gap-2">
              <span>โดย: {post.authorId}</span>
              {post.authorRole && post.authorRole !== '' && (
                <span className="text-xs">({post.authorRole})</span>
              )}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <MessageCircle size={20} className="text-orange-500" />
            คำแนะนำจากเพื่อนๆ ({comments.length})
          </h3>
          
          <div className="space-y-4 mb-8">
            {comments.map((comment: any) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={comment.id} 
                className="bg-white p-5 rounded-2xl border border-orange-50 shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-orange-600">{comment.authorId}</span>
                  <span className="text-[10px] text-slate-400">{timeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">{comment.content}</p>
              </motion.div>
            ))}
            {comments.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm italic">
                ยังไม่มีคำแนะนำ มาร่วมให้กำลังใจเพื่อนกันเถอะ
              </div>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="relative">
            <textarea 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="เขียนคำแนะนำหรือให้กำลังใจ..."
              className="w-full h-32 px-5 py-4 rounded-3xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none pr-16"
            />
            <button 
              type="submit"
              title="ส่งคำแนะนำ"
              className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all active:scale-90"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
      <footer className="py-12 text-center text-slate-400 text-xs">
        <p>© 2024 HealHeart. พื้นที่ปลอดภัยสำหรับทุกคน</p>
        <p className="mt-2">หากต้องการความช่วยเหลือเร่งด่วน ติดต่อสายด่วนสุขภาพจิต 1323</p>
      </footer>
    </div>
  );
}
