import HeroSection from '@/components/home/HeroSection';
import ProcessTimeline from '@/components/home/ProcessTimeline';
import TimberKnowledge from '@/components/home/TimberKnowledge';

export default function HomePage() {
  return (
    <div className="w-full bg-[#F5F5DC]">
      <HeroSection />

      {/* Value Proposition Spacer */}
      <section className="py-24 px-6 text-center bg-[#FAFAFA]">
        <p className="text-[#3E2723] text-[10px] sm:text-xs uppercase tracking-[0.4em] font-sans font-medium max-w-2xl mx-auto leading-loose">
          "True luxury lies in the integrity of the material. We don't just shape wood; we honor its history."
        </p>
      </section>

      <ProcessTimeline />

      <TimberKnowledge />

      {/* CTA Section */}
      <section className="py-40 px-6 bg-[#3E2723] text-center text-white relative overflow-hidden">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-8 max-w-3xl mx-auto leading-tight">Ready to Elevate Your Space?</h2>
        <p className="text-[#D4AF37] mb-12 max-w-xl mx-auto font-sans font-light tracking-wide text-lg">
          Explore our latest collection of handcrafted masterpieces.
        </p>
        <button className="bg-[#D4AF37] text-white px-12 py-5 uppercase text-[10px] font-sans font-bold tracking-[0.2em] hover:bg-white hover:text-[#3E2723] transition-colors duration-500 shadow-xl">
          View Collection
        </button>
      </section>
    </div>
  );
}