import type { Campaign, Submission, Creator } from "./types";

/* ── Mock campaigns ─────────────────────────────────────────── */

export const mockCampaigns: Campaign[] = [
  {
    id: "camp-001",
    title: "Línea Verano — Crema Solar FPS50",
    code: "GAIA-041",
    product: "Crema Solar FPS50",
    status: "Active",
    imageUrl: "/mock/camp-solar.jpg",
    creatorsApproved: 6,
    creatorsTarget: 10,
    videosSubmitted: 4,
    budget: 3200,
    roi: null,
    daysLeft: 18,
    productionPace: 40,
  },
  {
    id: "camp-002",
    title: "Reels — Tónico Facial Rosas",
    code: "GAIA-038",
    product: "Tónico Facial",
    status: "In Review",
    imageUrl: "/mock/camp-tonico.jpg",
    creatorsApproved: 8,
    creatorsTarget: 8,
    videosSubmitted: 7,
    budget: 2400,
    roi: null,
    daysLeft: 5,
    productionPace: 88,
  },
  {
    id: "camp-003",
    title: "Serum Vitamina C — Unboxing",
    code: "GAIA-035",
    product: "Serum Vitamina C",
    status: "Completed & Approved",
    imageUrl: "/mock/camp-serum.jpg",
    creatorsApproved: 5,
    creatorsTarget: 5,
    videosSubmitted: 5,
    budget: 1800,
    roi: 3.2,
    daysLeft: 0,
    productionPace: 100,
  },
];

/* ── Mock submissions ───────────────────────────────────────── */

export const mockSubmissions: Submission[] = [
  {
    id: "sub-001",
    status: "Pending Review",
    thumbnailUrl: "/mock/thumb-1.jpg",
    creator: {
      name: "Valentina Ros",
      handle: "@valeross.uoc",
      avatarUrl: "",
      matchScore: 94,
    },
    campaignTitle: "Línea Verano — Crema Solar FPS50",
    videoDuration: "0:32",
    hookVariant: "Hook Empático (Problema → Solución)",
    rating: 4.8,
    payoutAmount: 320,
  },
  {
    id: "sub-002",
    status: "Pending Review",
    thumbnailUrl: "/mock/thumb-2.jpg",
    creator: {
      name: "Lucía Fernández",
      handle: "@luci.fer.ugc",
      avatarUrl: "",
      matchScore: 91,
    },
    campaignTitle: "Línea Verano — Crema Solar FPS50",
    videoDuration: "0:28",
    hookVariant: "Hook de Resultado (Antes → Después)",
    rating: 4.6,
    payoutAmount: 320,
  },
  {
    id: "sub-003",
    status: "Pending Review",
    thumbnailUrl: "/mock/thumb-3.jpg",
    creator: {
      name: "Camila Herrera",
      handle: "@camiherreraUGC",
      avatarUrl: "",
      matchScore: 88,
    },
    campaignTitle: "Reels — Tónico Facial Rosas",
    videoDuration: "0:45",
    hookVariant: "Hook de Routine (Get Ready With Me)",
    rating: 4.5,
    payoutAmount: 280,
  },
];

/* ── Mock creators (talent pool) ────────────────────────────── */

export const mockCreators: Creator[] = [
  {
    id: "cr-001",
    name: "Valentina Ros",
    handle: "@valeross.uoc",
    avatarUrl: "",
    followers: "12.4K",
    engagementRate: 5.8,
    invited: false,
  },
  {
    id: "cr-002",
    name: "Lucía Fernández",
    handle: "@luci.fer.ugc",
    avatarUrl: "",
    followers: "8.7K",
    engagementRate: 6.2,
    invited: true,
  },
  {
    id: "cr-003",
    name: "Camila Herrera",
    handle: "@camiherreraUGC",
    avatarUrl: "",
    followers: "23.1K",
    engagementRate: 4.9,
    invited: false,
  },
];
