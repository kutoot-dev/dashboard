/** Types for Discover feed (posts, comments, likes) */

export interface DiscoverPost {
  id: number;
  title: string;
  body: string;
  category: "discover" | "academy";
  is_pinned: boolean;
  likes_count: number;
  views_count: number;
  author: string;
  published_at: string;
  created_at: string;
}

export interface PostComment {
  id: number;
  body: string;
  author: string;
  parent_id: number | null;
  created_at: string;
}

export interface DiscoverPostDetail extends DiscoverPost {
  comments: PostComment[];
}

export interface LikeToggleResult {
  liked: boolean;
  likes_count: number;
}
