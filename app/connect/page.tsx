import Header from "@/components/Header";
import ConnectHero from "@/components/ConnectHero";
import Pair from "@/components/Pair";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";
import { getActiveCampaign } from "@/lib/campaigns";

export const metadata = {
  title: "Rust | Twitch Drops — Connect Account",
};

export const dynamic = "force-dynamic";

export default async function ConnectPage() {
  const campaign = await getActiveCampaign();

  return (
    <>
      <Header active="connect" />
      <ConnectHero campaign={campaign} />
      <Pair />
      <FAQ />
      <Footer />
    </>
  );
}
