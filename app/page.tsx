import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Metrics from "@/components/Metrics";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header active="drops" />
      <Hero />
      <Metrics />
      <FAQ />
      <Footer />
    </>
  );
}
