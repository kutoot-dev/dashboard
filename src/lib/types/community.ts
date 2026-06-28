export interface CommunityUser {
  id: number | string;
  name: string | null;
  email?: string | null;
  mobile?: string | null;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data: T;
  meta?: Record<string, unknown>;
}

export interface CommunityAuthPayload {
  token?: string;
  access_token?: string;
  user?: CommunityUser;
  requires_name?: boolean;
  mobile?: string;
}

export interface CommunityPost {
  id: number;
  type: "update" | "safety_alert" | "poll" | "service_request" | "marketplace" | "event";
  title?: string | null;
  body?: string | null;
  status: string;
  area?: string | null;
  counts: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
  is_boosted: boolean;
  boosted_until?: string | null;
  author?: CommunityUser | null;
  team?: { id: number | string; name: string; code?: string | null } | null;
  tags?: { id: number; name: string; slug: string }[];
  liked_by_me?: boolean;
  media?: { id: number; url: string; thumb_url?: string | null; preview_url?: string | null; mime_type: string }[];
  poll?: {
    id: number;
    question: string;
    allow_multiple: boolean;
    closes_at?: string | null;
    options: { id: number; label: string; votes_count: number }[];
  } | null;
  event?: { event_at?: string | null; ends_at?: string | null; location?: string | null } | null;
  marketplace?: { price?: string | null; currency: string; condition?: string | null; status: string } | null;
  service_request?: { budget_min?: string | null; budget_max?: string | null; currency: string; status: string } | null;
  created_at?: string;
}

export interface CommunityConversation {
  id: number;
  post?: CommunityPost;
  buyer?: CommunityUser;
  seller?: CommunityUser;
  last_message_at?: string | null;
  latest_message?: CommunityMessage | null;
}

export interface CommunityMessage {
  id: number;
  conversation_id: number;
  body: string;
  sender?: CommunityUser;
  created_at?: string;
}
