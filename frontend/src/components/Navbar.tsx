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

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#Fdfbf7]/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="text-2xl md:text-3xl font-serif font-bold tracking-tighter text-[#3E2723]">
          G Kastha
          <span className="text-[#D4AF37] text-xs uppercase tracking-[0.3em] block font-sans font-normal mt-1 ml-1">Living</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {['Shop', 'Raw Material', 'About'].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase().replace(' ', '-')}`}
              className="text-[#3E2723] text-xs uppercase tracking-[0.2em] font-medium hover:text-[#D4AF37] transition-colors relative group"
            >
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#D4AF37] transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-6 text-[#3E2723]">
          <button className="hover:text-[#D4AF37] transition-colors">
            <Search size={20} strokeWidth={1.5} />
          </button>

          <NotificationsDropdown />

          {session ? (
            <div className="relative group">
              <button className="hover:text-[#D4AF37] transition-colors">
                <User size={20} strokeWidth={1.5} />
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
              <User size={20} strokeWidth={1.5} />
            </Link>
          )}

          <Link href="/cart" className="relative hover:text-[#D4AF37] transition-colors">
            <ShoppingBag size={20} strokeWidth={1.5} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#D4AF37] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <button className="md:hidden">
            <Menu size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </header>
  );
}
