"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await login(email, password);

        if (result.success) {
            router.push('/account');
        } else {
            setError(result.error || "خطأ في تسجيل الدخول. يرجى التحقق من بياناتك.");
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="w-full max-w-md space-y-12 animate-fade-in text-center">

                {/* Branding */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-serif text-black uppercase tracking-widest">Yemeni Market</h1>
                    <p className="text-gray-400 text-sm uppercase tracking-[0.2em] font-medium">Customer Login / تسجيل الدخول</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-xs text-center border border-red-100 uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-black/60">Email Address / البريد الإلكتروني</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-black/20 py-3 text-black placeholder-black/20 focus:border-black outline-none transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs uppercase tracking-wider text-black/60">Password (Code) / الرمز</label>
                            <a href="#" className="text-xs text-gray-400 hover:text-black transition-colors">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-black/20 py-3 text-black placeholder-black/20 focus:border-black outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-black/90 transition-colors disabled:bg-black/50"
                    >
                        {isLoading ? "Signing In..." : "Sign In / دخول"}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-sm text-black/60">
                    <p>Don&apos;t have an account? <Link href="/register" className="text-black font-bold border-b border-black/20 hover:border-black transition-colors">Create one</Link></p>
                </div>

                <div className="pt-12 border-t border-black/5">
                    <Link href="/" className="text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors">
                        Return to Store / العودة للمتجر
                    </Link>
                </div>
            </div>
        </main>
    );
}
