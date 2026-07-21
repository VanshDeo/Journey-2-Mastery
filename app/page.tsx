import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Levels from "@/components/Levels";
import ComingSoonSection from "@/components/ComingSoonSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="bg-(--color-off-white) min-h-screen">
      <Navbar />
      <Hero />
      <Levels />
      <ComingSoonSection id="timeline" title="Timeline" />
      <ComingSoonSection id="mentors" title="Mentors" />
      <ComingSoonSection id="prizes" title="Prizes" />
      <Footer />
    </main>
  );
}
