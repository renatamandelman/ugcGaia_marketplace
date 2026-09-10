import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { HowItWorks } from "@/components/sections/how-it-works";
import { CampaignFeed } from "@/components/sections/campaign-feed";
import { TrustStats } from "@/components/sections/trust-stats";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <CampaignFeed />
      <HowItWorks />
      <TrustStats />
    </>
  );
}