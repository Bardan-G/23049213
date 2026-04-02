'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/heero.png"
                    alt="G Kastha Luxury Living"
                    fill
                    className="object-cover brightness-[0.75] object-center"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a]/40 via-transparent to-[#1a1a1a]/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20 md:mt-0">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="text-[#D4AF37] font-sans text-[10px] md:text-sm uppercase tracking-[0.4em] font-medium mb-6"
                >
                    From Forest to Furniture
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.15] mb-8"
                >
                    The Whole Chain <br /> of Luxury
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    className="text-[#EBE7E0] font-sans text-base md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-12"
                >
                    We control every step—from timber sawmill to your living room.
                    Experience the purity of handcrafted Scandinavian design.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.8 }}
                    className="flex flex-col sm:flex-row gap-6 justify-center"
                >
                    <button className="bg-[#D4AF37] text-white px-12 py-5 uppercase text-[10px] font-sans font-bold tracking-[0.2em] hover:bg-white hover:text-[#3E2723] transition-all duration-500 shadow-xl">
                        Explore Collection
                    </button>
                    <button className="border border-white/50 text-white px-12 py-5 uppercase text-[10px] font-sans font-bold tracking-[0.2em] hover:bg-white hover:text-[#3E2723] transition-all duration-500 backdrop-blur-sm">
                        Our Process
                    </button>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
                <span className="text-[#F9F9F9] text-[10px] uppercase tracking-widest">Scroll</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37] to-transparent"></div>
            </motion.div>
        </section>
    );
}
