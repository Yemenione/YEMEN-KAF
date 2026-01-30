"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube, Linkedin, MessageCircle, Music, Ghost, Mail, MapPin, Phone, Send } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useSettings } from "@/context/SettingsContext";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";

export default function Footer() {
    const { t, locale } = useLanguage();
    const { settings } = useSettings();
    const { showToast } = useToast();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            const res = await fetch("/api/newsletter", {
                method: "POST",
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                showToast("Thank you for subscribing!", "success");
                setEmail("");
            } else {
                showToast("Subscription failed.", "error");
            }
        } catch {
            showToast("An error occurred.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-white text-[var(--coffee-brown)] border-t border-[var(--coffee-brown)]/10">
            {/* Newsletter Section */}
            <div className="border-b border-[var(--coffee-brown)]/10">
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-start">
                        <h3 className="text-2xl font-serif text-[var(--coffee-brown)]">{t('newsletter.joinTitle')}</h3>
                        <p className="text-[var(--coffee-brown)]/60 text-sm italic">{t('newsletter.joinSubtitle')}</p>
                    </div>
                    <form onSubmit={handleSubscribe} className="w-full md:w-auto flex items-end border-b border-[var(--coffee-brown)] focus-within:border-[var(--honey-gold)] transition-colors py-2">
                        <input
                            type="email"
                            placeholder={t('newsletter.placeholder') || "Your email address"}
                            className="bg-transparent outline-none px-4 py-2 w-full md:w-80 text-sm"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            disabled={loading}
                            type="submit"
                            className="bg-black text-white p-3 hover:bg-[var(--coffee-brown)] transition-all uppercase text-[10px] font-bold tracking-widest flex items-center gap-2"
                        >
                            {loading ? "..." : <Send size={14} />}
                        </button>
                    </form>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand Column */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-serif text-[var(--coffee-brown)] tracking-widest uppercase">{settings.site_name}</h2>
                    <p className="text-[var(--coffee-brown)]/60 text-sm leading-relaxed max-w-xs">
                        {(locale === 'en' ? settings.site_description : null) || t('footer.description')}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        {settings.social_instagram && (
                            <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <Instagram size={20} />
                            </a>
                        )}
                        {settings.social_facebook && (
                            <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <Facebook size={20} />
                            </a>
                        )}
                        {settings.social_whatsapp && (
                            <a href={settings.social_whatsapp} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <MessageCircle size={20} />
                            </a>
                        )}
                        {settings.social_twitter && (
                            <a href={settings.social_twitter} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <Twitter size={20} />
                            </a>
                        )}
                        {settings.social_tiktok && (
                            <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                                    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                                </svg>
                            </a>
                        )}
                        {settings.social_youtube && (
                            <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <Youtube size={20} />
                            </a>
                        )}
                        {settings.social_snapchat && (
                            <a href={settings.social_snapchat} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <Ghost size={20} />
                            </a>
                        )}
                        {settings.social_linkedin && (
                            <a href={settings.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors">
                                <Linkedin size={20} />
                            </a>
                        )}
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-6 text-[var(--coffee-brown)] text-xs">{t('footer.quickLinks')}</h3>
                    <ul className="space-y-4 text-sm text-[var(--coffee-brown)]/70">
                        {(() => {
                            if (!settings.menu_footer_links) return (
                                <>
                                    <li><Link href="/shop" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.shopAll')}</Link></li>
                                    <li><Link href="/our-story" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.ourStory')}</Link></li>
                                    <li><Link href="/the-farms" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.theFarms')}</Link></li>
                                    <li><Link href="/contact" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.contact')}</Link></li>
                                    <li><Link href="/track-order" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.trackOrder')}</Link></li>
                                </>
                            );

                            try {
                                const LINKS = JSON.parse(settings.menu_footer_links);
                                if (!Array.isArray(LINKS)) return null;
                                return LINKS.map((item: { href: string; label: string }, idx: number) => (
                                    <li key={idx}><Link href={item.href} className="hover:text-[var(--honey-gold)] transition-colors">{item.label}</Link></li>
                                ));
                            } catch {
                                return null;
                            }
                        })()}
                    </ul>
                </div>

                {/* Collections */}
                <div>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-6 text-[var(--coffee-brown)] text-xs">{t('footer.collections')}</h3>
                    <ul className="space-y-4 text-sm text-[var(--coffee-brown)]/70">
                        <li><Link href="/shop?category=honey" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.honey')}</Link></li>
                        <li><Link href="/shop?category=coffee" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.coffee')}</Link></li>
                        <li><Link href="/shop?category=gifts" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.gifts')}</Link></li>
                        <li><Link href="/shop?category=wholesale" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.wholesale')}</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-6 text-[var(--coffee-brown)] text-xs">{t('footer.contact')}</h3>
                    <ul className="space-y-4 text-sm text-[var(--coffee-brown)]/70">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-[var(--honey-gold)] mt-0.5" />
                            <span>{settings.store_address || t('footer.address')}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-[var(--honey-gold)]" />
                            <span>{settings.support_phone}</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-[var(--honey-gold)]" />
                            <span>{settings.support_email}</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[var(--coffee-brown)]/10 py-8 text-center text-xs text-[var(--coffee-brown)]/40 uppercase tracking-widest px-6">
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-4">
                    <Link href="/mentions-legales" className="hover:text-[var(--coffee-brown)] transition-colors">{t('footer.legal.mentions') || 'Mentions Légales'}</Link>
                    <Link href="/cgv" className="hover:text-[var(--coffee-brown)] transition-colors">{t('footer.legal.cgv') || 'CGV'}</Link>
                    <Link href="/privacy" className="hover:text-[var(--coffee-brown)] transition-colors">{t('footer.privacy')}</Link>
                    <Link href="/terms" className="hover:text-[var(--coffee-brown)] transition-colors">{t('footer.terms')}</Link>
                </div>
                <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
            </div>
        </footer>
    );
}
