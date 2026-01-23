"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

export default function LoginPage() {
    const { login } = useAuth();
    const { t } = useLanguage();
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const user = (result as any).user;
            if (user?.isAdmin || user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') {
                router.push('/admin-portal');
            } else {
                router.push('/account');
            }
        } else {
            setError(result.error || t('auth.error.login'));
        }
        setIsLoading(false);
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-white px-6 pt-32">
            <div className="w-full max-w-md space-y-12 animate-fade-in text-center">

                {/* Branding */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-serif text-black uppercase tracking-widest">Yemeni Market</h1>
                    <p className="text-gray-400 text-sm uppercase tracking-[0.2em] font-medium">{t('auth.customerLogin')}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6 text-left">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-500 text-xs text-center border border-red-100 uppercase tracking-wider">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wider text-black/60">{t('auth.email')}</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-black/20 py-3 text-black placeholder-black/20 focus:border-black outline-none transition-colors"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-xs uppercase tracking-wider text-black/60">{t('auth.passwordCode')}</label>
                            <a href="#" className="text-xs text-gray-400 hover:text-black transition-colors">{t('auth.forgot')}</a>
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
                        {isLoading ? t('auth.signingIn') : t('auth.signIn')}
                    </button>
                </form>

                <div className="text-sm text-black/60">
                    <p>{t('auth.noAccount')} <Link href="/register" className="text-black font-bold border-b border-black/20 hover:border-black transition-colors">{t('auth.createOne')}</Link></p>
                </div>

                <div className="pt-12 border-t border-black/5">
                    <Link href="/" className="text-xs uppercase tracking-widest text-black/40 hover:text-black transition-colors">
                        {t('auth.returnToStore')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
