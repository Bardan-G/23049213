'use client';
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, Menu, X, MessageSquare } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/auth/login');
        } else if (status === 'authenticated' && session?.user.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    if (status === 'loading') return <div className="min-h-screen flex items-center justify-center">Loading Admin Panel...</div>;

    if (!session || session.user.role !== 'admin') return null;

    return (
        <div className="flex min-h-screen bg-slate-50 relative">
            {/* Mobile Menu Button */}
            <button
                className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white rounded shadow-md text-gray-800"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar (Desktop + Mobile Overlay) */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1a1a] text-white transform transition-transform duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                md:relative md:translate-x-0 md:flex md:flex-col
            `}>
                <div className="p-6 border-b border-gray-700 mt-12 md:mt-0">
                    <h1 className="text-xl font-bold">Admin Panel</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition">
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>
                    <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition">
                        <Package size={20} />
                        Products
                    </Link>
                    <Link href="/admin/orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition">
                        <ShoppingBag size={20} />
                        Orders
                    </Link>
                    <Link href="/admin/chat" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition">
                        <MessageSquare size={20} />
                        Live Chat
                    </Link>
                    <Link href="#" className="flex items-center gap-3 px-4 py-3 rounded hover:bg-white/10 transition opacity-50 cursor-not-allowed">
                        <Users size={20} />
                        Users (Soon)
                    </Link>
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-white/10 rounded transition">
                        <LogOut size={20} />
                        Exit to Store
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto w-full md:ml-0">
                {/* Mobile Header Spacer */}
                <div className="h-10 md:hidden"></div>
                {children}
            </main>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
