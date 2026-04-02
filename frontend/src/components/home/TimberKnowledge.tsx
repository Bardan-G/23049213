'use client';

import { motion } from 'framer-motion';
import { Droplets, Hammer, Scale } from 'lucide-react';

const timbers = [
    {
        name: "Sal Wood (Shorea Robusta)",
        origin: "Nepal Terai Region",
        density: "High (880 kg/m³)",
        moisture: "12-14% (Seasoned)",
        description: "Known for its incredible strength and durability. Resistant to termites and fungi, making it perfect for structural frames.",
        color: "bg-[#3E2723] text-[#F9F9F9]"
    },
    {
        name: "Burma Teak",
        origin: "Sustainable Plantations",
        density: "Medium-High (660 kg/m³)",
        moisture: "10-12% (Kiln Dried)",
        description: "The gold standard of furniture. Rich in natural oils that protect against weather and pests. Ages to a beautiful golden-brown.",
        color: "bg-[#D4AF37] text-[#3E2723]"
    },
    {
        name: "Sisau (Indian Rosewood)",
        origin: "Western Nepal",
        density: "High (770 kg/m³)",
        moisture: "12% (Seasoned)",
        description: "Prized for its dark, rich grain patterns. Highly rot-resistant and finishes to a smooth, lustrous surface.",
        color: "bg-[#EBE7E0] text-[#3E2723]"
    }
];

export default function TimberKnowledge() {
    return (
        <section className="py-24 bg-[#F9F9F9]">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center mb-16">
                    <span className="text-[#3E2723] text-[10px] uppercase tracking-[0.4em] font-sans font-medium block mb-4">Raw Material Expertise</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#3E2723]">Know Your Wood</h2>
                    <p className="mt-6 text-[#3E2723]/80 font-sans font-light max-w-2xl mx-auto leading-relaxed">
                        We don't just buy wood; we understand it. Every plank is tested for density and moisture content before it enters our workshop.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {timbers.map((timber, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className={`${timber.color} p-8 rounded-lg shadow-lg hover:-translate-y-2 transition-transform duration-300 relative overflow-hidden group`}
                        >
                            <h3 className="text-2xl font-serif mb-2">{timber.name}</h3>
                            <p className="text-[10px] font-sans uppercase tracking-[0.3em] opacity-80 mb-6">{timber.origin}</p>

                            <div className="space-y-4 mb-8 font-sans">
                                <div className="flex items-center gap-3">
                                    <Scale size={18} className="opacity-70" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold opacity-60">Density</p>
                                        <p className="text-sm font-medium">{timber.density}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Droplets size={18} className="opacity-70" />
                                    <div>
                                        <p className="text-[10px] uppercase font-bold opacity-60">Moisture Content</p>
                                        <p className="text-sm font-medium">{timber.moisture}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-sm font-sans font-light leading-relaxed opacity-90 border-t border-current pt-6 border-opacity-20">
                                {timber.description}
                            </p>

                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Hammer size={120} />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
