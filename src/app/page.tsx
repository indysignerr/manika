import Preloader from "@/components/Preloader";
import ScrollManager from "@/components/ScrollManager";
import Hero from "@/components/Hero";
import ProReassurance from "@/components/ProReassurance";
import FeaturedCollection from "@/components/FeaturedCollection";
import PromoVideo from "@/components/PromoVideo";
import Story from "@/components/Story";
import SisterBrands from "@/components/SisterBrands";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollManager />
      <Hero />
      <ProReassurance />
      <FeaturedCollection />
      <PromoVideo />
      <Story />
      <SisterBrands />
      <Newsletter />
    </>
  );
}
