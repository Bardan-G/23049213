'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';

const steps = [
    {
        title: "Timber Sourcing",
        description: "We select only the finest Sal and Teak from sustainable forests. Every log is inspected for grain density and purity.",
        image: "https://images.unsplash.com/photo-1543255006-d6395b6f1171?w=800",
        year: "01"
    },
    {
        title: "Natural Seasoning",
        description: "Wood is air-dried for 18 months to achieve the perfect moisture level, ensuring longevity and resistance to warping.",
        image: "https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800",
        year: "02"
    },
    {
        title: "Master Craftsmanship",
        description: "Our artisans hand-carve each piece, blending traditional heritage techniques with modern precision.",
        image: "https://images.unsplash.com/photo-1517166365457-36e6ba935574?w=800",
        year: "03"
    },
    {
        title: "White Glove Delivery",
        description: "Delivered to your home with care, assembled by our experts, and placed exactly where you want it.",
        image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800",
        year: "04"
    }
];

export default function ProcessTimeline() {
    return (
        <section className="py-24 bg-[#EBE7E0] text-[#3E2723]">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-24">
                    <span className="text-[#3E2723] text-xs uppercase tracking-[0.3em] font-bold block mb-4">Our Methodology</span>
                    <h2 className="text-4xl md:text-5xl font-serif">The Whole Chain Process</h2>
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

function TimelineItem({ step, index }: { step: any, index: number }) {
    const isEven = index % 2 === 0;
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"]
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, 0]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);

    return (
        <motion.div
            ref={ref}
            style={{ y, opacity }}
            className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${isEven ? '' : 'md:flex-row-reverse'}`}
        >
            {/* Image Side */}
            <div className="flex-1 w-full">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-sm shadow-xl">
                    <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 px-4 py-2 font-serif text-2xl">
                        {step.year}
                    </div>
                </div>
            </div>

            {/* Text Side */}
            <div className="flex-1 w-full text-center md:text-left">
                <h3 className="text-3xl font-serif mb-6 text-[#3E2723]">{step.title}</h3>
                <p className="text-[#3E2723]/80 leading-relaxed font-light text-lg">
                    {step.description}
                </p>
                <div className={`w-12 h-[1px] bg-[#D4AF37] mt-8 ${isEven ? 'md:mr-auto' : 'md:ml-auto md:mr-0'} mx-auto`}></div>
            </div>
        </motion.div>
    );
}
