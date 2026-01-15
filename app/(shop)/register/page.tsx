"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        const result = await register({ name, email, passwordCode: password });

        if (result.success) {
            router.push('/account');
        } else {
            setError(result.error || "فشل تسجيل الحساب. يرجى المحاولة مرة أخرى.");
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-white px-6">
            <div className="w-full max-w-md space-y-12 animate-fade-in text-center">

                {/* Branding */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-serif text-black uppercase tracking-widest">Yemeni Market</h1>
                    <p className="text-gray-400 text-sm uppercase tracking-[0.2em] font-medium">Create Account / إنشاء حساب</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-xs text-center border border-red-100 uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-black/60">Full Name / الاسم الكامل</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b border-black/20 py-3 text-black placeholder-black/20 focus:border-black outline-none transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

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
                        <label className="text-xs uppercase tracking-wider text-black/60">Password (Code) / الرمز</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-black/20 py-3 text-black placeholder-black/20 focus:border-black outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                        <input type="checkbox" required className="mt-1" />
                        <p className="text-xs text-black/60">
                            I agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-black/90 transition-colors disabled:bg-black/50"
                    >
                        {isLoading ? "Creating Account..." : "Create Account / إنشاء الحساب"}
                    </button>
                </form>

                {/* Footer */}
                <div className="text-sm text-black/60">
                    <p>Already have an account? <Link href="/login" className="text-black font-bold border-b border-black/20 hover:border-black transition-colors">Sign In</Link></p>
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
