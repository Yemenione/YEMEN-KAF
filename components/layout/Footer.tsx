"use client";

import Link from "next/link";
import { Facebook, Instagram, Twitter, Mail, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
    const { t } = useLanguage();

    return (
        <footer className="bg-white text-[var(--coffee-brown)] border-t border-[var(--coffee-brown)]/10">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">

                {/* Brand Column */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-serif text-[var(--coffee-brown)] tracking-widest uppercase">Yemeni Market</h2>
                    <p className="text-[var(--coffee-brown)]/60 text-sm leading-relaxed max-w-xs">
                        {t('footer.description')}
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors"><Instagram size={20} /></a>
                        <a href="#" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors"><Facebook size={20} /></a>
                        <a href="#" className="text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors"><Twitter size={20} /></a>
                    </div>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-bold uppercase tracking-widest mb-6 text-[var(--coffee-brown)] text-xs">{t('footer.quickLinks')}</h3>
                    <ul className="space-y-4 text-sm text-[var(--coffee-brown)]/70">
                        <li><Link href="/shop" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.shopAll')}</Link></li>
                        <li><Link href="/our-story" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.ourStory')}</Link></li>
                        <li><Link href="/the-farms" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.theFarms')}</Link></li>
                        <li><Link href="/contact" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.contact')}</Link></li>
                        <li><Link href="/track-order" className="hover:text-[var(--honey-gold)] transition-colors">{t('footer.trackOrder')}</Link></li>
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
                            <span>123 Avenue des Champs-Élysées,<br />75008 Paris, France</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-[var(--honey-gold)]" />
                            <span>+33 6 95 23 97 94</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-[var(--honey-gold)]" />
                            <span>contact@yemeni-market.com</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-[var(--coffee-brown)]/10 py-8 text-center text-xs text-[var(--coffee-brown)]/40 uppercase tracking-widest">
                <p>&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
            </div>
        </footer>
    );
}
