"use client";

import { Truck, ShieldCheck, Star } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function TrustIndicators() {
    const { t } = useLanguage();

    return (
        <section className="w-full py-6 border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="flex flex-col items-center gap-4 group">
                    <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('trust.shipping')}</h3>
                        <p className="text-sm text-[var(--coffee-brown)]/60">{t('product.freeShippingDesc') || 'Livraison gratuite dès 100€'}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                    <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('trust.authentic') || 'Produits Authentiques'}</h3>
                        <p className="text-sm text-[var(--coffee-brown)]/60">{t('trust.quality') || 'Qualité Premium Garantie'}</p>
                    </div>
                </div>
                <div className="flex flex-col items-center gap-4 group">
                    <div className="p-4 rounded-full bg-gray-50 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                        <Star className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-serif text-[var(--coffee-brown)] text-lg">{t('trust.excellence') || 'Excellence Yéménite'}</h3>
                        <p className="text-sm text-[var(--coffee-brown)]/60">{t('trust.subtitle') || 'Le meilleur du Yémen à votre porte'}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
