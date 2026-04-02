'use client';
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, User, Heart, ShoppingBag, Menu } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useSession, signOut } from "next-auth/react";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const cart = useCartStore((state) => state.cart);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (session?.accessToken) {
      fetchCart(session.accessToken);
    }
  }, [session, fetchCart]);

  if (pathname?.startsWith('/admin')) {
    return null; // Don't cover Admin dashboard with global storefront Navbar
  }

  const isHomePage = pathname === '/';
  
  // Conditionally handle the header styling
  const headerClass = isHomePage
      ? (isScrolled ? 'bg-[#FAFAFA]/95 backdrop-blur-xl py-4 shadow-sm border-b border-gray-100' : 'bg-transparent py-8 border-b border-transparent')
      : 'bg-[#FAFAFA] py-4 shadow-sm border-b border-gray-100'; // Default solid style for subpages

  const textClass = isHomePage && !isScrolled ? 'text-white' : 'text-[#3E2723]';
  const logoTextClass = isHomePage && !isScrolled ? 'text-white' : 'text-[#3E2723]';
  const linkTextClass = (item: string) => 
      isHomePage && !isScrolled ? 'text-white hover:text-[#D4AF37]' : 'text-[#3E2723] hover:text-[#D4AF37]';
  
  return (
    <header className={`fixed w-full z-50 transition-all duration-500 ${headerClass}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className={`text-2xl md:text-3xl font-serif tracking-tight transition-colors duration-500 ${logoTextClass}`}>
          G Kastha
          <span className="text-[#D4AF37] text-[10px] uppercase tracking-[0.4em] block font-sans font-medium mt-1 ml-1">Living</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-10">
          {['Shop', 'Raw Material', 'About'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(' ', '-')}`}
              className={`text-[10px] sm:text-xs uppercase tracking-[0.2em] font-sans font-medium transition-colors duration-300 relative group ${linkTextClass(item)}`}
            >
              {item}
              <span className="absolute -bottom-1.5 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className={`flex items-center gap-6 transition-colors duration-500 ${textClass}`}>
          <button className="hover:text-[#D4AF37] transition-colors">
            <Search size={20} strokeWidth={1} />
          </button>

          <NotificationsDropdown />

          {session ? (
            <div className="relative group">
              <button className="hover:text-[#D4AF37] transition-colors">
                <User size={20} strokeWidth={1} />
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 top-full pt-4 w-40 hidden group-hover:block">
                <div className="bg-white shadow-xl rounded-sm border border-gray-100 py-2">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="text-[10px] text-gray-400 uppercase">Signed in as</p>
                    <p className="text-xs font-bold truncate">{session.user.name || session.user.email}</p>
                  </div>
                  {session.user.role === 'admin' && (
                    <Link href="/admin" className="block px-4 py-2 text-xs font-bold text-[#3E2723] hover:bg-[#F9F9F9]">Admin Panel</Link>
                  )}
                  <Link href="/dashboard" className="block px-4 py-2 text-xs hover:bg-[#F9F9F9]">User Dashboard</Link>
                  <button onClick={() => signOut()} className="block w-full text-left px-4 py-2 text-xs text-red-500 hover:bg-[#F9F9F9]">Logout</button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/auth/login" className="hover:text-[#D4AF37] transition-colors">
              <User size={20} strokeWidth={1} />
            </Link>
          )}

          <Link href="/cart" className="relative hover:text-[#D4AF37] transition-colors">
            <ShoppingBag size={20} strokeWidth={1} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button className="md:hidden hover:text-[#D4AF37] transition-colors">
            <Menu size={24} strokeWidth={1} />
          </button>
        </div>
      </div>
    </header>
  );
}
