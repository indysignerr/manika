import Preloader from "@/components/Preloader";
import Hero from "@/components/Hero";
import FeaturedCollection from "@/components/FeaturedCollection";
import Story from "@/components/Story";
import Ingredients from "@/components/Ingredients";
import Rituels from "@/components/Rituels";
import Testimonials from "@/components/Testimonials";
import Newsletter from "@/components/Newsletter";

export default function Home() {
  return (
    <>
      <Preloader />
      <Hero />
      <FeaturedCollection />
      <Story />
      <Ingredients />
      <Rituels />
      <Testimonials />
      <Newsletter />
    </>
  );
}
