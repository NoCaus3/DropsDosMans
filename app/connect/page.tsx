import Header from "@/components/Header";
import ConnectHero from "@/components/ConnectHero";
import Pair from "@/components/Pair";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Rust | Twitch Drops — Connect Account",
};

export const dynamic = "force-dynamic";

export default function ConnectPage() {
  return (
    <>
      <Header active="connect" />
      <ConnectHero />
      <Pair />
      <FAQ />
      <Footer />
    </>
  );
}
