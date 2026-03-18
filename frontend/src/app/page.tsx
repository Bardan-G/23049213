import HeroSection from '@/components/home/HeroSection';
import ProcessTimeline from '@/components/home/ProcessTimeline';
import TimberKnowledge from '@/components/home/TimberKnowledge';

export default function HomePage() {
  return (
    <div className="w-full bg-[#F5F5DC]">
      <HeroSection />

      {/* Value Proposition Spacer */}
      <section className="py-20 px-6 text-center bg-[#F9F9F9]">
        <p className="text-[#3E2723] text-sm uppercase tracking-[0.2em] font-medium max-w-2xl mx-auto leading-loose">
          "True luxury lies in the integrity of the material. We don't just shape wood; we honor its history."
        </p>
      </section>

      <ProcessTimeline />

      <TimberKnowledge />

      {/* CTA Section */}
      <section className="py-32 px-6 bg-[#3E2723] text-center text-[#F9F9F9]">
        <h2 className="text-4xl md:text-5xl font-serif mb-6">Ready to Elevate Your Space?</h2>
        <p className="text-[#D4AF37] mb-10 max-w-xl mx-auto font-light">
          Explore our latest collection of handcrafted masterpieces.
        </p>
        <button className="bg-[#D4AF37] text-[#3E2723] px-12 py-4 uppercase text-xs font-bold tracking-widest hover:bg-[#F9F9F9] transition-all duration-300">
          View Collection
        </button>
      </section>
    </div>
  );
}