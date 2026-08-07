import Preloader from "@/components/Preloader";
import ScrollManager from "@/components/ScrollManager";
import Hero from "@/components/Hero";
import FeaturedCollection from "@/components/FeaturedCollection";
import PromoVideo from "@/components/PromoVideo";
import Story from "@/components/Story";
import SisterBrands from "@/components/SisterBrands";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollManager />
      <Hero />
      <FeaturedCollection />
      <PromoVideo />
      <Story />
      <SisterBrands />
      <Testimonials />
      <Newsletter />
    </>
  );
}
