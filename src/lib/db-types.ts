export type UserRole = "creator" | "brand";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  handle?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  banner_url?: string | null;
  portfolio_url?: string | null;
  location?: string | null;
  tags?: string[] | null;
  industry?: string | null;
  website?: string | null;
  tiktok_url?: string | null;
  instagram_url?: string | null;
  youtube_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type CampaignStatus = "open" | "filled" | "closed";

export interface CampaignRow {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max?: number | null;
  deliverables?: string | null;
  deadline?: string | null;
  status: CampaignStatus;
  tags?: string[] | null;
  created_at: string;
}

export type ApplicationStatus = "pending" | "accepted" | "rejected";

export interface ApplicationRow {
  id: string;
  campaign_id: string;
  creator_id: string;
  pitch?: string | null;
  status: ApplicationStatus;
  created_at: string;
}

export type PortfolioPlatform = "tiktok" | "instagram" | "youtube" | "other";
export type PortfolioMediaType = "video" | "image";

export interface PortfolioItem {
  id: string;
  creator_id: string;
  title: string;
  description?: string | null;
  media_type: PortfolioMediaType;
  media_url: string;
  platform: PortfolioPlatform;
  thumbnail_url?: string | null;
  created_at: string;
  updated_at: string;
}