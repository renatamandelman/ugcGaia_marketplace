import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CampaignFeed } from "@/components/sections/campaign-feed";
import { CreatorSpotlight } from "@/components/sections/creator-spotlight";
import { TrustStats } from "@/components/sections/trust-stats";
import { DualCta } from "@/components/sections/dual-cta";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <HowItWorks />
      <CampaignFeed />
      <CreatorSpotlight />
      <TrustStats />
      <DualCta />
    </>
  );
}