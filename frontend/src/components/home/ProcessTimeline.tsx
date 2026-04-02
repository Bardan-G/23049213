"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import { image } from "framer-motion/client";

const steps = [
  {
    title: "Consultation & Design",
    description:
      "We begin with architectural conceptualization, using digital precision to plan your space's flow, aesthetics, and Vastu alignment.",
      image:'https://res.cloudinary.com/ddzlstxcq/image/upload/v1774866984/Consultation_Design_ijjpna.png',
      
  },
  {
    title: "Material Curation",
    description:
      "We hand-select premium Teak, Sakhuwa, and Masala hardwood. Every piece is vetted for grain consistency and structural integrity.",
    image: "https://res.cloudinary.com/ddzlstxcq/image/upload/v1774867709/Gemini_Generated_Image_p6rtl9p6rtl9p6rt_fqixqs.png",
    
  },
  {
    title: "Precision Execution",
    description:
     "Our design visions are brought to life by master technicians using industrial standards to ensure flawless joinery and world-class finishing.",
    image: "https://res.cloudinary.com/ddzlstxcq/image/upload/v1774867892/Gemini_Generated_Image_nqasxbnqasxbnqas_obkgj1.png",
    
  },
  {
    title: "Seamless Integration",
    description:
      "We manage the entire installation, ensuring that every door, frame, and furniture piece integrates perfectly into your modern environment.",
    image: "https://res.cloudinary.com/ddzlstxcq/image/upload/v1774868044/Gemini_Generated_Image_ww1q85ww1q85ww1q_f584ox.png",
    
  },
];

export default function ProcessTimeline() {
  return (
    <section className="py-24 bg-[#EBE7E0] text-[#3E2723]">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-24">
          <span className="text-[#3E2723] text-[10px] uppercase tracking-[0.4em] font-sans font-medium block mb-4">
            Our Methodology
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#3E2723]">
            The Whole Chain Process
          </h2>
        </div>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-[1px] bg-[#3E2723]/20 hidden md:block"></div>

          <div className="space-y-24 md:space-y-32">
            {steps.map((step, i) => (
              <TimelineItem key={i} step={step} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineItem({ step, index }: { step: any; index: number }) {
  const isEven = index % 2 === 0;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

//   const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
//   const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

  return (
    <motion.div
      ref={ref}
    //   style={{ y, opacity }}
      className={`group flex flex-col md:flex-row items-center gap-12 md:gap-24 cursor-default transition-all duration-700 ${isEven ? "" : "md:flex-row-reverse"}`}
    >
      {/* Image Side */}
      <div className="flex-1 w-full">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm shadow-xl group-hover:shadow-2xl transition-all duration-700">
          <Image
            src={step.image}
            alt={step.title}
            fill
            className="object-cover brightness-[0.85] group-hover:brightness-110 group-hover:scale-105 transition-all duration-700"
          />
          
        </div>
      </div>

      {/* Text Side */}
      <div className="flex-1 w-full text-center md:text-left transition-all duration-700 opacity-90 group-hover:opacity-100">
        <h3 className="text-3xl font-serif mb-6 text-[#3E2723] group-hover:text-[#D4AF37] transition-colors duration-500">
          {step.title}
        </h3>
        <p className="text-[#3E2723]/80 leading-relaxed font-sans font-light text-lg transition-colors duration-500 group-hover:text-[#3E2723]">
          {step.description}
        </p>
        <div
          className={`w-12 h-[1px] bg-[#3E2723]/30 group-hover:bg-[#D4AF37] group-hover:w-24 transition-all duration-500 mt-8 ${isEven ? "md:mr-auto" : "md:ml-auto md:mr-0"} mx-auto`}
        ></div>
      </div>
    </motion.div>
  );
}
