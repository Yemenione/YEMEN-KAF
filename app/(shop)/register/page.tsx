"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

export default function RegisterPage() {
    const { t } = useLanguage();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--cream-white)] px-6">
            <div className="w-full max-w-md space-y-12 animate-fade-in text-center">

                {/* Branding */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-serif text-[var(--coffee-brown)] uppercase tracking-widest">Yemeni Market</h1>
                    <p className="text-[var(--honey-gold)] text-sm uppercase tracking-[0.2em] font-medium">Create Account</p>
                </div>

                {/* Form */}
                <form className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/60">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b border-[var(--coffee-brown)]/20 py-3 text-[var(--coffee-brown)] placeholder-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-colors"
                            placeholder="John Doe"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/60">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-[var(--coffee-brown)]/20 py-3 text-[var(--coffee-brown)] placeholder-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-colors"
                            placeholder="name@example.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/60">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-[var(--coffee-brown)]/20 py-3 text-[var(--coffee-brown)] placeholder-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-start gap-3 pt-2">
                        <input type="checkbox" className="mt-1" />
                        <p className="text-xs text-[var(--coffee-brown)]/60">
                            I agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
                        </p>
                    </div>

                    <button type="submit" className="w-full py-4 bg-[var(--coffee-brown)] text-[var(--cream-white)] font-bold uppercase tracking-widest text-xs hover:bg-[var(--coffee-brown)]/90 transition-colors">
                        Create Account
                    </button>
                </form>

                {/* Footer */}
                <div className="text-sm text-[var(--coffee-brown)]/60">
                    <p>Already have an account? <Link href="/login" className="text-[var(--coffee-brown)] font-bold border-b border-[var(--coffee-brown)]/20 hover:border-[var(--coffee-brown)] transition-colors">Sign In</Link></p>
                </div>

                <div className="pt-12 border-t border-[var(--coffee-brown)]/5">
                    <Link href="/" className="text-xs uppercase tracking-widest text-[var(--coffee-brown)]/40 hover:text-[var(--coffee-brown)] transition-colors">
                        Return to Store
                    </Link>
                </div>
            </div>
        </main>
    );
}
