import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { Mail, Gift } from "lucide-react";

export default function Newsletter() {
    const { t, locale } = useLanguage();
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState("");



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setStatus('success');
                setMessage(t('newsletter.success'));
                setEmail("");
            } else {
                setStatus('error');
                setMessage(t('newsletter.error'));
            }
        } catch {
            setStatus('error');
            setMessage(t('newsletter.error'));
        }

        setTimeout(() => {
            setStatus('idle');
            setMessage("");
        }, 5000);
    };

    return (
        <section className="py-8 bg-gradient-to-r from-[var(--honey-gold)] to-[var(--coffee-brown)]">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Mail className="w-8 h-8 text-white" />
                    <h2 className="text-3xl md:text-4xl font-serif text-white">
                        {t('newsletter.title')}
                    </h2>
                </div>

                <p className="text-white/90 text-lg mb-8 flex items-center justify-center gap-2">
                    <Gift className="w-5 h-5" />
                    {t('newsletter.subtitle')}
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 max-w-md mx-auto">
                    <input
                        type="email"
                        placeholder={t('newsletter.placeholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                        required
                        disabled={status === 'loading'}
                        dir={locale === 'ar' ? 'rtl' : 'ltr'}
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="px-8 py-4 bg-white text-[var(--coffee-brown)] rounded-lg font-bold uppercase tracking-wider hover:bg-gray-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                        {status === 'loading' ? t('newsletter.loading') : t('newsletter.button')}
                    </button>
                </form>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg ${status === 'success' ? 'bg-green-500/20 text-white' : 'bg-red-500/20 text-white'}`}>
                        {message}
                    </div>
                )}
            </div>
        </section>
    );
}
