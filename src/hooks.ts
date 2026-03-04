import React, { useState, useEffect } from 'react';
import { supabase } from './lib/firebase';
import { getAnonymousId, Post, Comment } from './types';
import { filterProfanity } from './lib/utils';

const MOCK_POSTS: Post[] = [
  {
    id: '1',
    title: 'รู้สึกเหนื่อยกับงานมากเลยครับ',
    content: 'ช่วงนี้งานเยอะมาก ทำงานล่วงเวลาทุกวันจนไม่มีเวลาพักผ่อนเลย รู้สึกหมดไฟมากครับ',
    category: 'การทำงาน',
    authorId: 'User-1234',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    likes: 15,
    commentCount: 8,
    reportCount: 0,
    isResolved: false
  },
  {
    id: '2',
    title: 'ทะเลาะกับแฟนเรื่องเล็กน้อย',
    content: 'วันนี้ทะเลาะกับแฟนเพราะเรื่องเล็กน้อย รู้สึกเสียใจมาก ไม่รู้จะทำยังไงดี',
    category: 'ความรัก',
    authorId: 'User-5678',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    likes: 23,
    commentCount: 12,
    reportCount: 0,
    isResolved: false
  },
  {
    id: '3',
    title: 'สอบไม่ผ่าน รู้สึกท้อแท้',
    content: 'สอบไม่ผ่านอีกแล้ว ตั้งใจเรียนมามากแต่ก็ยังไม่ได้ รู้สึกท้อใจมาก',
    category: 'การเรียน',
    authorId: 'User-9012',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    likes: 8,
    commentCount: 5,
    reportCount: 0,
    isResolved: false
  }
];

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setPosts(MOCK_POSTS);
      setLoading(false);
      return;
    }

    const fetchPosts = async () => {
      if (!supabase) return;
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .lt('report_count', 5)
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error:', error);
        setPosts(MOCK_POSTS);
      } else {
        setPosts(data.map((p: any) => ({
          id: p.id,
          title: p.title,
          content: p.content,
          category: p.category,
          authorId: p.author_id,
          authorRole: p.author_role,
          createdAt: p.created_at,
          likes: p.likes,
          commentCount: p.comment_count,
          reportCount: p.report_count,
          isResolved: p.is_resolved
        })));
      }
      setLoading(false);
    };

    fetchPosts();

    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts();
      })
      .subscribe();

    return () => { if (supabase) supabase.removeChannel(channel); };
  }, []);

  const createPost = async (title: string, content: string, category: string) => {
    if (!supabase) return;
    const filteredTitle = filterProfanity(title);
    const filteredContent = filterProfanity(content);
    const { getUserRole } = await import('./types');
    const role = await getUserRole();
    
    await supabase.from('posts').insert({
      title: filteredTitle,
      content: filteredContent,
      category,
      author_id: getAnonymousId(),
      author_role: role,
      likes: 0,
      comment_count: 0,
      report_count: 0,
      is_resolved: false
    });
  };

  const likePost = async (postId: string) => {
    if (!supabase) return;
    const { hasLikedPost, addLikedPost } = await import('./types');
    if (hasLikedPost(postId)) return;
    addLikedPost(postId);
    
    const { data } = await supabase.from('posts').select('likes').eq('id', postId).single();
    if (data) {
      await supabase.from('posts').update({ likes: data.likes + 1 }).eq('id', postId);
    }
  };

  const reportPost = async (postId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('posts').select('report_count').eq('id', postId).single();
    if (data) {
      await supabase.from('posts').update({ report_count: data.report_count + 1 }).eq('id', postId);
    }
  };

  const deletePost = async (postId: string) => {
    if (!supabase) return;
    await supabase.from('posts').update({ is_resolved: true, report_count: 0 }).eq('id', postId);
  };

  return { posts, loading, createPost, likePost, reportPost, deletePost };
}

export function useComments(postId: string) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!postId || !supabase) return;

    const fetchComments = async () => {
      if (!supabase) return;
      
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (data) {
        setComments(data.map((c: any) => ({
          id: c.id,
          postId: c.post_id,
          content: c.content,
          authorId: c.author_id,
          createdAt: c.created_at
        })));
      }
    };

    fetchComments();

    const channel = supabase
      .channel(`comments-${postId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `post_id=eq.${postId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => { if (supabase) supabase.removeChannel(channel); };
  }, [postId]);

  const addComment = async (content: string) => {
    if (!supabase) return;
    const filteredContent = filterProfanity(content);
    
    await supabase.from('comments').insert({
      post_id: postId,
      content: filteredContent,
      author_id: getAnonymousId()
    });

    const { data } = await supabase.from('posts').select('comment_count').eq('id', postId).single();
    if (data) {
      await supabase.from('posts').update({ comment_count: data.comment_count + 1 }).eq('id', postId);
    }
  };

  return { comments, addComment };
}
