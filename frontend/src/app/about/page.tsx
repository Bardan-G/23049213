import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen pt-32 pb-24 text-[#3E2723]">
      <div className="max-w-5xl mx-auto px-6 sm:px-12">
        {/* Header */}
        <div className="text-center mb-24">
          <span className="text-[10px] uppercase tracking-[0.4em] font-sans font-medium block mb-6 text-[#D4AF37]">
            Our Heritage
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight mb-8">
            The Art of <br /> Woodcraft
          </h1>
          <div className="w-16 h-[1px] bg-[#D4AF37] mx-auto"></div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 mb-32 items-center">
          <div className="order-2 md:order-1 relative aspect-[3/4] w-full">
            <Image 
              src="https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800"
              alt="Artisan woodworking"
              fill
              className="object-cover rounded-sm shadow-xl"
            />
            <div className="absolute inset-0 border border-[#D4AF37]/30 transform translate-x-4 translate-y-4 -z-10 rounded-sm"></div>
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl font-serif mb-6 text-[#3E2723]">A Legacy Carved in Timber</h2>
            <p className="font-sans font-light text-lg leading-relaxed text-[#3E2723]/80 mb-6">
              At G Kastha, we believe that true luxury lies in honoring the natural integrity of the material. Our journey begins deep within the sustainable forests of Nepal, where only the finest Sal and Teak are meticulously selected.
            </p>
            <p className="font-sans font-light text-lg leading-relaxed text-[#3E2723]/80">
              For generations, our artisans have passed down the secrets of traditional joinery and natural seasoning. We blend these heritage techniques with modern Scandinavian design principles to create pieces that speak to both the past and the future.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-[#3E2723] text-[#FAFAFA] p-12 sm:p-20 rounded-sm shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-serif mb-16 text-white">Our Core Principles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
              <div>
                <span className="text-[#D4AF37] font-serif text-4xl block mb-4">01.</span>
                <h3 className="text-xl font-sans font-bold tracking-widest uppercase text-[10px] mb-4">Sustainability</h3>
                <p className="font-sans font-light text-sm leading-relaxed text-[#EBE7E0]">
                  Every log is ethically sourced. We plant two trees for every one we harvest, ensuring the forest thrives alongside our craft.
                </p>
              </div>
              <div>
                <span className="text-[#D4AF37] font-serif text-4xl block mb-4">02.</span>
                <h3 className="text-xl font-sans font-bold tracking-widest uppercase text-[10px] mb-4">Uncompromising Quality</h3>
                <p className="font-sans font-light text-sm leading-relaxed text-[#EBE7E0]">
                  From air-drying for 18 months to hand-rubbed finishes, we never rush the process. True mastery takes time.
                </p>
              </div>
              <div>
                <span className="text-[#D4AF37] font-serif text-4xl block mb-4">03.</span>
                <h3 className="text-xl font-sans font-bold tracking-widest uppercase text-[10px] mb-4">Timeless Design</h3>
                <p className="font-sans font-light text-sm leading-relaxed text-[#EBE7E0]">
                  We design for generations, not seasons. Our clean lines and robust construction ensure your furniture becomes a family heirloom.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
