import Header from "@/components/Header";
import Hero from "@/components/Hero";
import DropsList from "@/components/DropsList";
import Metrics from "@/components/Metrics";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getActiveCampaign, getCampaignDrops } from "@/lib/campaigns";

export const dynamic = "force-dynamic";

export default async function Home() {
  const campaign = await getActiveCampaign();
  const drops = campaign ? await getCampaignDrops(campaign.id) : [];

  return (
    <>
      <Header active="drops" />
      <Hero campaign={campaign} />
      {campaign && <DropsList drops={drops} />}
      <Metrics />
      <FAQ />
      <Footer />
    </>
  );
}
