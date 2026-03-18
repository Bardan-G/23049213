export default function Footer() {
  return (
    <footer className="bg-[#263238] text-white/70 py-16 px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-white font-serif text-2xl mb-6">G Kastha Living</h3>
          <p className="text-xs leading-relaxed">Sustainable craftsmanship for generations to come.</p>
        </div>
        <div>
          <h4 className="text-white font-sans text-xs uppercase tracking-widest mb-6">Shop</h4>
          <ul className="space-y-3 text-xs">
            <li>Sofas</li>
            <li>Beds & Lighting</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-sans text-xs uppercase tracking-widest mb-6">Service</h4>
          <ul className="space-y-3 text-xs">
            <li>FAQ</li>
            <li>Returns</li>
          </ul>
        </div>
        <div className="flex flex-col items-center justify-center border-l border-white/10">
           <div className="border border-[#d4af37] p-4 rounded-full text-[10px] text-[#d4af37] text-center uppercase">
              Genuine <br/> Quality
           </div>
        </div>
      </div>
    </footer>
  );
}