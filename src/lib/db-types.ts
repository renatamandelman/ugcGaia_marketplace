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

export interface ConversationRow {
  id: string;
  campaign_id: string | null;
  application_id: string | null;
  brand_id: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

export type NotificationType =
  | "application_received"
  | "application_accepted"
  | "application_rejected"
  | "message_received"
  | "brief_available"
  | "deliverable_submitted"
  | "deliverable_approved"
  | "changes_requested"
  | "collaboration_cancelled";

export interface NotificationRow {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export type CollaborationStatus =
  | "brief_sent"
  | "in_progress"
  | "submitted"
  | "approved"
  | "cancelled";

export type PaymentStatus = "held" | "released" | "refunded";

export type DeliverableStatus = "submitted" | "approved" | "changes_requested";

export interface BriefSnapshot {
  title?: string;
  description?: string;
  category?: string;
  deliverables?: string | null;
  deadline?: string | null;
  budget_min?: number;
  budget_max?: number | null;
}

export interface CollaborationRow {
  id: string;
  campaign_id: string;
  application_id: string;
  brand_id: string;
  creator_id: string;
  status: CollaborationStatus;
  payment_status: PaymentStatus;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  creator_amount: number;
  brief_snapshot: BriefSnapshot;
  deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface DeliverableRow {
  id: string;
  collaboration_id: string;
  creator_id: string;
  version: number;
  file_path: string | null;
  external_url: string | null;
  notes: string | null;
  status: DeliverableStatus;
  feedback: string | null;
  reviewed_by: string | null;
  submitted_at: string;
  reviewed_at: string | null;
}

export interface WalletRow {
  user_id: string;
  balance: number;
  updated_at: string;
}

export type WalletTransactionKind = "hold" | "release" | "refund";

export interface WalletTransactionRow {
  id: string;
  user_id: string;
  collaboration_id: string | null;
  kind: WalletTransactionKind;
  amount: number;
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