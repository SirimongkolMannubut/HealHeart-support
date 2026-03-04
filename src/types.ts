import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/firebase';

const ANON_ID_KEY = 'healheart_anon_id';
const LIKED_POSTS_KEY = 'healheart_liked_posts';
const BOOKMARKED_POSTS_KEY = 'healheart_bookmarked_posts';
const USER_ROLE_KEY = 'healheart_user_role';

export const USER_ROLES = [
  '👨‍🎓 นักเรียน/นักศึกษา',
  '💼 คนทำงาน',
  '👨‍👩‍👧 พ่อแม่/ผู้ปกครอง',
  '🏠 แม่บ้าน',
  '🎨 ฟรีแลนซ์',
  '💔 โสด',
  '💑 มีแฟน/แต่งงาน',
  '🤷 อื่นๆ',
];

export function getAnonymousId(): string {
  if (typeof localStorage === 'undefined') return 'User-unknown';
  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = `User-${uuidv4().substring(0, 8)}`;
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}

export function getLikedPosts(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const liked = localStorage.getItem(LIKED_POSTS_KEY);
  return liked ? JSON.parse(liked) : [];
}

export function addLikedPost(postId: string): void {
  if (typeof localStorage === 'undefined') return;
  const liked = getLikedPosts();
  if (!liked.includes(postId)) {
    liked.push(postId);
    localStorage.setItem(LIKED_POSTS_KEY, JSON.stringify(liked));
  }
}

export function hasLikedPost(postId: string): boolean {
  return getLikedPosts().includes(postId);
}

export function getBookmarkedPosts(): string[] {
  if (typeof localStorage === 'undefined') return [];
  const bookmarked = localStorage.getItem(BOOKMARKED_POSTS_KEY);
  return bookmarked ? JSON.parse(bookmarked) : [];
}

export function toggleBookmark(postId: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  const bookmarked = getBookmarkedPosts();
  const index = bookmarked.indexOf(postId);
  if (index > -1) {
    bookmarked.splice(index, 1);
  } else {
    bookmarked.push(postId);
  }
  localStorage.setItem(BOOKMARKED_POSTS_KEY, JSON.stringify(bookmarked));
  return index === -1;
}

export function isBookmarked(postId: string): boolean {
  return getBookmarkedPosts().includes(postId);
}

export async function getUserRole(): Promise<string | null> {
  if (typeof localStorage === 'undefined') return null;
  
  let role = localStorage.getItem(USER_ROLE_KEY);
  if (role) return role;
  
  if (!supabase) return null;
  
  const userId = getAnonymousId();
  const { data } = await supabase
    .from('users')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  if (data?.role) {
    localStorage.setItem(USER_ROLE_KEY, data.role);
    return data.role;
  }
  
  return null;
}

export async function setUserRole(role: string): Promise<void> {
  if (typeof localStorage === 'undefined') return;
  
  localStorage.setItem(USER_ROLE_KEY, role);
  
  if (!supabase) return;
  
  const userId = getAnonymousId();
  await supabase.from('users').upsert({
    user_id: userId,
    role: role,
  });
}

// createdAt can be a Date, Firestore Timestamp-like object (with toDate()),
// ISO string, or number. Keep flexible for integration with Firestore.
export interface Post {
  id: string;
  title: string;
  content?: string;
  category?: string;
  authorId?: string;
  authorRole?: string;
  createdAt?: Date | { toDate?: () => Date } | string | number;
  likes?: number;
  commentCount?: number;
  reportCount?: number;
  isResolved?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  content?: string;
  authorId?: string;
  authorRole?: string;
  createdAt?: Date | { toDate?: () => Date } | string | number;
}

export default {
  getAnonymousId,
};
