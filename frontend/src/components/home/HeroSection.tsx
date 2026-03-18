'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000" // Premium living room
                    alt="G Kastha Luxury Living"
                    fill
                    className="object-cover brightness-[0.7]"
                    priority
                />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-[#D4AF37] text-sm md:text-base uppercase tracking-[0.3em] font-medium mb-4"
                >
                    From Forest to Furniture
                </motion.p>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-serif text-[#F9F9F9] leading-tight mb-8"
                >
                    The Whole Chain <br /> of Luxury
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-[#EBE7E0] text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto mb-10"
                >
                    We control every step—from timber sawmill to your living room.
                    Experience the purity of handcrafted Scandinavian design.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8 }}
                    className="flex flex-col md:flex-row gap-4 justify-center"
                >
                    <button className="bg-[#D4AF37] text-[#3E2723] px-10 py-4 uppercase text-xs font-bold tracking-widest hover:bg-[#F9F9F9] transition-colors duration-300">
                        Explore Collection
                    </button>
                    <button className="border border-[#F9F9F9] text-[#F9F9F9] px-10 py-4 uppercase text-xs font-bold tracking-widest hover:bg-[#F9F9F9] hover:text-[#3E2723] transition-colors duration-300">
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
