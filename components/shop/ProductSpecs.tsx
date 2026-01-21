"use client";

import { useState } from "react";
import { Package, Weight, MapPin, Clock, Award, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductSpecsProps {
    weight: number;
    origin?: string;
    shelfLife?: string;
    description?: string;
    category?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    category_translations?: any;
}

export default function ProductSpecs({
    weight,
    origin = "Yemen",
    shelfLife = "24 months",
    description = "",
    category = "honey",
    translations,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    category_translations
}: ProductSpecsProps) {
    const { t, getLocalizedValue } = useLanguage();
    const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'shipping'>('description');

    const weightInLbs = (weight * 2.20462).toFixed(2);

    // Dynamic specifications based on category
    const getSpecifications = () => {
        const baseSpecs = [
            {
                icon: Weight,
                label: t('product.weight') || 'Weight',
                value: `${weight} kg (${weightInLbs} lbs)`
            },
            {
                icon: MapPin,
                label: t('product.origin') || 'Origin',
                value: origin
            },
            {
                icon: Clock,
                label: t('product.shelfLife') || 'Shelf Life',
                value: shelfLife
            }
        ];

        // Category-specific specs
        if (category === 'honey') {
            return [
                ...baseSpecs,
                {
                    icon: Award,
                    label: t('product.purity') || 'Purity',
                    value: t('product.purityValue')
                },
                {
                    icon: Package,
                    label: t('product.packaging') || 'Packaging',
                    value: t('product.packagingHoney')
                }
            ];
        } else if (category === 'coffee') {
            return [
                ...baseSpecs,
                {
                    icon: Award,
                    label: t('product.roastLevel') || 'Roast Level',
                    value: t('product.roastLevelValue')
                },
                {
                    icon: Package,
                    label: t('product.packaging') || 'Packaging',
                    value: t('product.packagingCoffee')
                }
            ];
        }

        return baseSpecs;
    };

    const specifications = getSpecifications();


    return (

        <div className="mt-20 border-t border-gray-100 pt-16">
            {/* Premium Tabs */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex bg-gray-100 p-1.5 rounded-full">
                    <button
                        onClick={() => setActiveTab('description')}
                        className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'description'
                            ? 'bg-black text-white shadow-lg'
                            : 'text-gray-500 hover:text-black'
                            }`}
                    >
                        {t('product.description')}
                    </button>
                    <button
                        onClick={() => setActiveTab('specs')}
                        className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'specs'
                            ? 'bg-black text-white shadow-lg'
                            : 'text-gray-500 hover:text-black'
                            }`}
                    >
                        {t('product.specifications')}
                    </button>
                    <button
                        onClick={() => setActiveTab('shipping')}
                        className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activeTab === 'shipping'
                            ? 'bg-black text-white shadow-lg'
                            : 'text-gray-500 hover:text-black'
                            }`}
                    >
                        {t('product.shipping') || 'Livraison'}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-sm min-h-[400px]">
                {/* Description Tab */}
                {activeTab === 'description' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="prose prose-stone prose-lg text-gray-600 leading-loose">
                            {getLocalizedValue({ description, translations }, 'description') ? (
                                <p dangerouslySetInnerHTML={{ __html: getLocalizedValue({ description, translations }, 'description') }} />
                            ) : (
                                <p>{t('product.defaultDescription')}</p>
                            )}
                        </div>
                        <div className="space-y-6">
                            <div className="flex gap-4 p-6 bg-amber-50/50 rounded-2xl border border-amber-100">
                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Award size={24} />
                                </div>
                                <div>
                                    <h4 className="font-serif text-lg text-[var(--coffee-brown)] mb-2">{t('product.qualityGuaranteed')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('product.certifiedShipping')}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                                <div className="w-12 h-12 bg-stone-200 text-stone-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h4 className="font-serif text-lg text-[var(--coffee-brown)] mb-2">{t('product.authenticity')}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed">{t('product.authenticityDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Specifications Tab */}
                {activeTab === 'specs' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {specifications.map((spec, index) => {
                            const Icon = spec.icon;
                            return (
                                <div key={index} className="flex flex-col items-center text-center p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-transparent hover:border-gray-100 group">
                                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                        <Icon className="w-8 h-8 text-[var(--coffee-brown)]" />
                                    </div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">{spec.label}</h4>
                                    <p className="font-serif text-xl text-black">{spec.value}</p>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className="font-serif text-2xl text-[var(--coffee-brown)]">Délais de Livraison</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-600 flex items-center gap-2"><MapPin size={16} /> France Métropolitaine</span>
                                    <span className="font-bold text-black">48h - 72h</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-600 flex items-center gap-2"><MapPin size={16} /> Europe</span>
                                    <span className="font-bold text-black">3 - 5 Jours</span>
                                </div>
                                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                                    <span className="font-medium text-gray-600 flex items-center gap-2"><MapPin size={16} /> International</span>
                                    <span className="font-bold text-black">5 - 10 Jours</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-[var(--coffee-brown)] text-white p-8 rounded-2xl flex flex-col justify-between">
                            <div>
                                <h3 className="font-serif text-2xl mb-4">Garantie Satisfait ou Remboursé</h3>
                                <p className="text-white/80 leading-relaxed text-sm mb-8">
                                    Nous nous engageons à vous offrir la meilleure qualité. Si vous n&apos;êtes pas satisfait de votre commande, vous disposez de 14 jours pour nous la retourner dans son emballage d&apos;origine.
                                </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-[#D4AF37]">
                                <Shield size={20} />
                                <span>Garantie 100% Sécurisé</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
