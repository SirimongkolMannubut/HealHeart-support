import { v4 as uuidv4 } from 'uuid';

const ANON_ID_KEY = 'healheart_anon_id';
const LIKED_POSTS_KEY = 'healheart_liked_posts';
const BOOKMARKED_POSTS_KEY = 'healheart_bookmarked_posts';

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

// createdAt can be a Date, Firestore Timestamp-like object (with toDate()),
// ISO string, or number. Keep flexible for integration with Firestore.
export interface Post {
  id: string;
  title: string;
  content?: string;
  category?: string;
  authorId?: string;
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
  createdAt?: Date | { toDate?: () => Date } | string | number;
}

export default {
  getAnonymousId,
};
