/* ── Dashboard domain types ────────────────────────────────────
 *  These types define the shape of data the DashboardView expects.
 *  Initially backed by mock data; the swap to Supabase will be
 *  a mechanical mapping (same fields, different source).
 */

export type TabType = "campaigns" | "submissions" | "analytics" | "talent";

/* ── Campaign ──────────────────────────────────────────────── */

export type CampaignDashboardStatus = "Active" | "In Review" | "Completed & Approved";

export interface Campaign {
  id: string;
  title: string;
  code: string;
  product: string;
  status: CampaignDashboardStatus;
  imageUrl: string;
  creatorsApproved: number;
  creatorsTarget: number;
  videosSubmitted: number;
  budget: number;
  /** Return on investment multiplier — null when not enough data */
  roi: number | null;
  daysLeft: number;
  productionPace: number;
}

/* ── Submission ────────────────────────────────────────────── */

export type SubmissionStatus = "Pending Review" | "Approved" | "Revision" | "Rejected";

export interface SubmissionCreator {
  name: string;
  handle: string;
  avatarUrl: string;
  matchScore: number;
}

export interface Submission {
  id: string;
  status: SubmissionStatus;
  thumbnailUrl: string;
  creator: SubmissionCreator;
  campaignTitle: string;
  videoDuration: string;
  hookVariant: string;
  rating: number;
  payoutAmount: number;
}

/* ── Creator (talent pool) ─────────────────────────────────── */

export interface Creator {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  followers: string;
  engagementRate: number;
  invited: boolean;
}
