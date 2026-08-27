/* Domain types for GaiaUGC MVP.
 * These mirror the future Supabase schema (1:1 columns) so the swap
 * from mock data to a real backend is mechanical, not architectural.
 */

export type CampaignStatus = "active" | "closing" | "filled";

export type CampaignPlatform = "Instagram" | "TikTok" | "YouTube" | "X";

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  /** Budget per creator, in USD */
  budget: number;
  /** What the brand needs — main value proposition of the brief */
  brief: string;
  requirements: string[];
  deliverables: string[];
  platforms: CampaignPlatform[];
  /** ISO date when applications close */
  deadline: string;
  publishedAt: string;
  applications: number;
  /** Open creator slots */
  slots: number;
  status: CampaignStatus;
}

export interface Creator {
  id: string;
  name: string;
  handle: string;
  niche: string;
  city: string;
  followers: number;
  rating: number;
  reviews: number;
  tags: string[];
  /** Rate per delivered video, in USD */
  ratePerVideo: number;
  completedDeals: number;
  verified: boolean;
  bio: string;
}