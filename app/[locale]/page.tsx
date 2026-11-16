import Clippers from "@/components/home/Clippers";
import Contact from "@/components/home/Contact";
import Creators from "@/components/home/Creators";
import FAQ from "@/components/home/Faq";
import Hero from "@/components/home/Hero";
import Statement from "@/components/home/Statement";
import Story from "@/components/home/Story";

export default function HomePage() {
  return (
    <main>
      <Hero /> {/* #home */}
      <Statement />
      <Story />
      <Clippers /> {/* #clippers */}
      <Creators /> {/* #creators */}
      <FAQ />
      <Contact /> {/* #contact */}
    </main>
  );
}
