"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Heart, PlusCircle, Shield, Search, TrendingUp, Clock, MessageCircle, AlertTriangle, Bookmark } from 'lucide-react';
import { usePosts } from '@/hooks';
import { CATEGORIES } from '@/lib/utils';
import { getAnonymousId, hasLikedPost, isBookmarked, toggleBookmark, getUserRole } from '@/types';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

function timeAgo(date: any): string {
  if (!date) return 'เมื่อสักครู่';
  const d = date.toDate ? date.toDate() : new Date(date);
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

const Navbar = React.memo(() => {
  const [anonId, setAnonId] = useState('');
  useEffect(() => {
    setAnonId(getAnonymousId());
  }, []);

  return (
    <nav className="sticky top-0 z-50 glass-card px-4 py-3 mb-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-400 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Heart fill="currentColor" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-xl text-slate-800">HealHeart</h1>
            <span className="text-[10px] uppercase tracking-widest text-orange-500 font-bold">Anonymous Support</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/bookmarks" className="text-amber-500 hover:text-amber-600">
            <Bookmark size={20} />
          </Link>
          <Link href="/admin" className="text-slate-400 hover:text-slate-600">
            <Shield size={20} />
          </Link>
          <div className="px-3 py-1 bg-orange-100 rounded-full text-orange-700 text-xs font-medium">
            {anonId}
          </div>
        </div>
      </div>
    </nav>
  );
});

const PostCard = React.memo(({ post, onLike, onReport }: { post: any; onLike: (id: string) => void; onReport: (id: string) => void }) => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  
  useEffect(() => {
    setLiked(hasLikedPost(post.id));
    setBookmarked(isBookmarked(post.id));
  }, [post.id]);

  return (
    <div className="glass-card p-6 rounded-3xl mb-4 hover:shadow-xl transition-all">
      <Link href={`/post/${post.id}`}>
        <div className="cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <span className="px-3 py-1 bg-white border border-orange-100 rounded-full text-orange-600 text-xs font-medium">
              {post.category}
            </span>
            <span className="text-slate-400 text-xs">{timeAgo(post.createdAt)}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-orange-600 transition-colors">{post.title}</h3>
          <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">{post.content}</p>
        </div>
      </Link>
      <div className="flex items-center justify-between pt-4 border-t border-orange-50">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => { 
              e.preventDefault();
              e.stopPropagation();
              if (!liked) {
                onLike(post.id);
                setLiked(true);
              }
            }}
            disabled={liked}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              liked ? "text-rose-500" : "text-slate-500 hover:text-rose-500"
            )}
          >
            <Heart size={18} fill={liked ? "currentColor" : "none"} />
            <span className="text-sm font-medium">{post.likes || 0}</span>
          </button>
          <Link href={`/post/${post.id}`} className="flex items-center gap-1.5 text-slate-400 hover:text-orange-500 transition-colors">
            <MessageCircle size={18} />
            <span className="text-sm font-medium">{post.commentCount || 0}</span>
          </Link>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const newState = toggleBookmark(post.id);
            setBookmarked(newState);
          }}
          className={cn(
            "p-2 transition-colors",
            bookmarked ? "text-amber-500" : "text-slate-300 hover:text-amber-500"
          )}
          title="บันทึก"
        >
          <Bookmark size={16} fill={bookmarked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  );
});

export default function HomePage() {
  const { posts, loading, likePost, reportPost } = usePosts();
  const [filter, setFilter] = useState('ทั้งหมด');
  const [sortBy, setSortBy] = useState('latest');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      const role = await getUserRole();
      if (!role) {
        router.push('/onboarding');
      }
    };
    checkRole();
  }, [router]);

  const filteredAndSortedPosts = useMemo(() => {
    let result = posts;
    
    if (search) {
      result = result.filter((p: any) => 
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.content?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (filter !== 'ทั้งหมด') {
      result = result.filter((p: any) => p.category === filter);
    }
    
    result = [...result].sort((a: any, b: any) => {
      if (sortBy === 'likes') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'comments') return (b.commentCount || 0) - (a.commentCount || 0);
      const aTime = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt || 0).getTime();
      const bTime = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
    
    return result;
  }, [posts, filter, sortBy, search]);

  const paginatedPosts = useMemo(() => 
    filteredAndSortedPosts.slice(0, page * PER_PAGE),
    [filteredAndSortedPosts, page]
  );

  const hasMore = paginatedPosts.length < filteredAndSortedPosts.length;

  if (loading) {
    return (
      <div className="min-h-screen font-sans">
        <Navbar />
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 pb-24">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">พื้นที่ปลอดภัยสำหรับใจคุณ</h2>
          <p className="text-slate-500">ระบายความในใจ ให้กำลังใจกันและกัน โดยไม่ต้องระบุตัวตน</p>
        </div>

        <div className="mb-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ค้นหาโพสต์..."
            className="w-full pl-12 pr-4 py-3 rounded-2xl border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
          <button
            onClick={() => { setFilter('ทั้งหมด'); setPage(1); }}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              filter === 'ทั้งหมด' ? "bg-orange-500 text-white shadow-lg" : "bg-white text-slate-600 border border-orange-100"
            )}
          >
            ทั้งหมด
          </button>
          {CATEGORIES.map((cat: string) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setPage(1); }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                filter === cat ? "bg-orange-500 text-white shadow-lg" : "bg-white text-slate-600 border border-orange-100"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setSortBy('latest'); setPage(1); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
              sortBy === 'latest' ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            )}
          >
            <Clock size={16} /> ล่าสุด
          </button>
          <button
            onClick={() => { setSortBy('likes'); setPage(1); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
              sortBy === 'likes' ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            )}
          >
            <TrendingUp size={16} /> ยอดไลค์
          </button>
          <button
            onClick={() => { setSortBy('comments'); setPage(1); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all",
              sortBy === 'comments' ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200"
            )}
          >
            <MessageCircle size={16} /> คอมเมนต์
          </button>
        </div>

        {paginatedPosts.length > 0 ? (
          <>
            {paginatedPosts.map(post => <PostCard key={post.id} post={post} onLike={likePost} onReport={reportPost} />)}
            {hasMore && (
              <button
                onClick={() => setPage(p => p + 1)}
                className="w-full py-3 bg-white border border-orange-100 rounded-2xl text-orange-600 font-medium hover:bg-orange-50 transition-all"
              >
                โหลดเพิ่มเติม
              </button>
            )}
          </>
        ) : (
          <div className="text-center py-12 glass-card rounded-3xl">
            <p className="text-slate-400">ไม่พบโพสต์</p>
          </div>
        )}

        <Link
          href="/create"
          className="fixed bottom-8 right-8 w-14 h-14 bg-orange-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
        >
          <PlusCircle size={28} />
        </Link>
      </div>
      <footer className="py-12 text-center text-slate-400 text-xs">
        <p>© 2024 HealHeart. พื้นที่ปลอดภัยสำหรับทุกคน</p>
        <p className="mt-2">หากต้องการความช่วยเหลือเร่งด่วน ติดต่อสายด่วนสุขภาพจิต 1323</p>
      </footer>
    </div>
  );
}
