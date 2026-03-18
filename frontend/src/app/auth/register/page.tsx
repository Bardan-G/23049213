'use client';

import api from "@/lib/axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link"; // For navigation between auth pages

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('auth/register', { email, password, name });
            alert('Registration Successful. Please Login.');
            router.push('/auth/login');
        } catch (error: any) {
            alert(error.response?.data?.message || 'Registration Failed');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen justify-center items-center bg-[#fdfbf7] px-6">
            <div className="w-full max-w-md space-y-8">
                {/* Brand Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-[#3e2723]">Create Account</h2>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold">
                        Join the Heritage Collective
                    </p>
                </div>

                <form onSubmit={handleRegister} className="mt-8 space-y-5">
                    <div className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="FULL NAME" 
                            required
                            className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-[11px] tracking-widest text-black focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-[#3e2723]/40" 
                            onChange={(e) => setName(e.target.value)} 
                        />
                        <input 
                            type="email" 
                            placeholder="EMAIL ADDRESS" 
                            required
                            className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-[11px] tracking-widest text-black focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-[#3e2723]/40" 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                        <input 
                            type="password" 
                            placeholder="PASSWORD" 
                            required
                            className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-[11px] tracking-widest text-black focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-[#3e2723]/40" 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>

                    <button 
                        disabled={loading}
                        className="w-full bg-[#3e2723] text-white py-4 mt-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#d4af37] transition-all disabled:opacity-50" 
                        type="submit"
                    >
                        {loading ? 'Processing...' : 'Register'}
                    </button>
                </form>

                {/* Navigation Toggle */}
                <div className="text-center pt-6">
                    <p className="text-[10px] uppercase tracking-widest text-[#3e2723]/60">
                        Already have an account?{' '}
                        <Link href="/auth/login" className="text-[#d4af37] font-bold hover:underline">
                            Login Here
                        </Link>
                    </p>
                </div>

                <p className="text-[9px] text-center text-[#3e2723]/30 uppercase tracking-widest pt-10">
                    Handcrafted Security • Heritage Standards
                </p>
            </div>
        </div>
    )
}