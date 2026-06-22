import { Hero } from '@/components/home/Hero';
import {
  FeaturedVehicles,
  WhyChooseUs,
  Stats,
  HowItWorks,
  Testimonials,
  Faqs,
  CtaBanner,
} from '@/components/home/Sections';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedVehicles />
      <WhyChooseUs />
      <Stats />
      <HowItWorks />
      <Testimonials />
      <Faqs />
      <CtaBanner />
    </>
  );
}
