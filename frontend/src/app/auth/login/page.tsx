'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Chrome, Smartphone, Loader2, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. NextAuth attempts to verify these credentials against your database via the 'credentials' provider
            const result = await signIn('credentials', {
                redirect: false, // Prevents automatic redirect so we can handle it manually
                email,
                password,
            });

            if (result?.error) {
                // Handle specific errors (e.g., User not found or wrong password)
                alert(result.error || 'Invalid credentials. Please check your email and password.');
            } else if (result?.ok) {
                // 2. Successful database check: Proceed to dashboard
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            alert('An unexpected error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen justify-center items-center bg-[#fdfbf7] px-6">
            <div className="w-full max-w-md space-y-8">
                {/* Brand Header */}
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-[#3e2723]">Studio Access</h2>
                    <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-bold">
                        Welcome back to Heritage Living
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    {/* 1. Traditional Login Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-5">
                        <div className="space-y-4">
                            <input
                                type="email"
                                placeholder="EMAIL ADDRESS"
                                required
                                className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-[11px] tracking-widest text-black focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-[#3e2723]/40"
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="PASSWORD"
                                    required
                                    className="w-full bg-transparent border-b border-[#3e2723]/20 py-3 text-[11px] tracking-widest text-black focus:outline-none focus:border-[#d4af37] transition-colors placeholder:text-[#3e2723]/40 pr-10"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[#3e2723]/40 hover:text-[#d4af37] transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-[#3e2723] text-white py-4 text-[10px] uppercase tracking-[0.3em] font-bold hover:bg-[#d4af37] transition-all flex justify-center items-center gap-2"
                            type="submit"
                        >
                            {loading ? <Loader2 className="animate-spin" size={14} /> : 'Enter Studio'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#3e2723]/10"></div></div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-widest text-[#3e2723]/40 bg-[#fdfbf7] px-4">Digital Identity</div>
                    </div>

                    {/* 2. Social & Phone Providers */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                            className="flex items-center justify-center gap-3 border border-[#3e2723]/10 py-3 hover:bg-[#f3f3f3] transition-all group"
                        >
                            <Chrome size={16} className="text-[#3e2723]/60 group-hover:text-[#d4af37]" />
                            <span className="text-[9px] uppercase tracking-widest font-bold">Google</span>
                        </button>

                        <button
                            onClick={() => router.push('/auth/phone')}
                            className="flex items-center justify-center gap-3 border border-[#3e2723]/10 py-3 hover:bg-[#f3f3f3] transition-all group"
                        >
                            <Smartphone size={16} className="text-[#3e2723]/60 group-hover:text-[#d4af37]" />
                            <span className="text-[9px] uppercase tracking-widest font-bold">Phone</span>
                        </button>
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="text-center pt-6 space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-[#3e2723]/60">
                        New to the Studio?{' '}
                        <Link href="/auth/register" className="text-[#d4af37] font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                    <Link href="/auth/forgot-password font-bold" className="block text-[9px] uppercase tracking-[0.2em] text-[#3e2723]/40 hover:text-[#3e2723]">
                        Forgot your password?
                    </Link>
                </div>
            </div>
        </div>
    );
}