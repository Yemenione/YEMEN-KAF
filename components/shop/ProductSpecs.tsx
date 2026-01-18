"use client";

import { useState } from "react";
import { Package, Weight, MapPin, Clock, Truck, Shield, RefreshCw, Award } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ProductSpecsProps {
    weight: number;
    origin?: string;
    shelfLife?: string;
    description?: string;
    category?: string;
}

export default function ProductSpecs({
    weight,
    origin = "Yemen",
    shelfLife = "24 months",
    description = "",
    category = "honey"
}: ProductSpecsProps) {
    const { t } = useLanguage();
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
                    label: 'Purity',
                    value: '100% Pure & Natural'
                },
                {
                    icon: Package,
                    label: 'Packaging',
                    value: 'Glass Jar'
                }
            ];
        } else if (category === 'coffee') {
            return [
                ...baseSpecs,
                {
                    icon: Award,
                    label: 'Roast Level',
                    value: 'Medium to Dark'
                },
                {
                    icon: Package,
                    label: 'Packaging',
                    value: 'Sealed Bag'
                }
            ];
        }

        return baseSpecs;
    };

    const specifications = getSpecifications();

    const shippingInfo = [
        {
            icon: Truck,
            title: t('product.freeShipping') || 'Free Shipping',
            desc: 'On orders over €50'
        },
        {
            icon: Shield,
            title: t('product.securePayment') || 'Secure Payment',
            desc: '100% secure transactions'
        },
        {
            icon: RefreshCw,
            title: t('product.easyReturns') || 'Easy Returns',
            desc: '30-day return policy'
        }
    ];

    return (
        <div className="mt-12 border-t border-gray-200">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 overflow-x-auto flex-nowrap scrollbar-hide -mx-6 px-6 md:mx-0 md:px-0">
                <button
                    onClick={() => setActiveTab('description')}
                    className={`whitespace-nowrap px-6 md:px-8 py-4 font-bold uppercase tracking-widest text-xs md:text-sm transition-all flex-shrink-0 ${activeTab === 'description'
                        ? 'border-b-2 border-black text-black'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    {t('product.description') || 'Description'}
                </button>
                <button
                    onClick={() => setActiveTab('specs')}
                    className={`whitespace-nowrap px-6 md:px-8 py-4 font-bold uppercase tracking-widest text-xs md:text-sm transition-all flex-shrink-0 ${activeTab === 'specs'
                        ? 'border-b-2 border-black text-black'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    {t('product.specifications') || 'Specifications'}
                </button>
                <button
                    onClick={() => setActiveTab('shipping')}
                    className={`whitespace-nowrap px-6 md:px-8 py-4 font-bold uppercase tracking-widest text-xs md:text-sm transition-all flex-shrink-0 ${activeTab === 'shipping'
                        ? 'border-b-2 border-black text-black'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    {t('product.shipping') || 'Shipping & Returns'}
                </button>
            </div>

            {/* Tab Content */}
            <div className="py-12">
                {/* Description Tab */}
                {activeTab === 'description' && (
                    <div className="prose max-w-none">
                        <div className="text-gray-700 leading-relaxed space-y-4">
                            {description ? (
                                <p className="text-lg">{description}</p>
                            ) : (
                                <>
                                    <p className="text-lg">
                                        Discover the authentic taste of Yemen with our premium selection.
                                        Each product is carefully sourced from the finest regions and
                                        processed with traditional methods to preserve its natural qualities.
                                    </p>
                                    <p>
                                        Our commitment to quality ensures that you receive only the best,
                                        maintaining the rich heritage and exceptional standards that Yemeni
                                        products are known for worldwide.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Key Features */}
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Award className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-black">Premium Quality</h4>
                                    <p className="text-sm text-gray-600">Certified and tested for purity</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-black">Authentic Origin</h4>
                                    <p className="text-sm text-gray-600">Sourced directly from Yemen</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Specifications Tab */}
                {activeTab === 'specs' && (
                    <div>
                        <h3 className="text-2xl font-serif text-black mb-8">Product Specifications</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {specifications.map((spec, index) => {
                                const Icon = spec.icon;
                                return (
                                    <div key={index} className="flex items-start gap-4 p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <div className="flex-shrink-0 w-12 h-12 bg-black rounded-full flex items-center justify-center">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-black mb-1">{spec.label}</h4>
                                            <p className="text-gray-600">{spec.value}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Shipping Estimate */}
                        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-black mb-1">Estimated Shipping Cost</h4>
                                    <p className="text-gray-600 text-lg font-semibold">
                                        {weight <= 1 ? '€5.99 - €8.99' : weight <= 3 ? '€8.99 - €12.99' : '€12.99 - €15.99'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Based on {weight}kg to France • Express shipping available</p>
                                </div>
                            </div>
                        </div>

                        {/* Storage Instructions */}
                        <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-xl">
                            <h4 className="font-bold text-black mb-2 flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                {t('product.storage') || 'Storage Instructions'}
                            </h4>
                            <p className="text-sm text-gray-700">
                                {t('product.storageInstructions') || 'Store in a cool, dry place away from direct sunlight. Keep container tightly closed to maintain freshness.'}
                            </p>
                        </div>
                    </div>
                )}

                {/* Shipping Tab */}
                {activeTab === 'shipping' && (
                    <div>
                        <h3 className="text-2xl font-serif text-black mb-8">Shipping & Returns</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            {shippingInfo.map((info, index) => {
                                const Icon = info.icon;
                                return (
                                    <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
                                        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h4 className="font-bold text-black mb-2">{info.title}</h4>
                                        <p className="text-sm text-gray-600">{info.desc}</p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Shipping Details */}
                        <div className="space-y-6">
                            <div className="p-6 border border-gray-200 rounded-xl">
                                <h4 className="font-bold text-black mb-4">Delivery Times</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">France (Standard)</span>
                                        <span className="font-semibold">2-4 business days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">France (Express)</span>
                                        <span className="font-semibold">1-2 business days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Europe</span>
                                        <span className="font-semibold">3-7 business days</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">International</span>
                                        <span className="font-semibold">7-14 business days</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border border-gray-200 rounded-xl">
                                <h4 className="font-bold text-black mb-4">Return Policy</h4>
                                <p className="text-sm text-gray-700 mb-3">
                                    We offer a 30-day return policy for all unopened products.
                                    Items must be in their original packaging and condition.
                                </p>
                                <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                                    <li>Free returns for defective items</li>
                                    <li>Return shipping costs may apply</li>
                                    <li>Refunds processed within 5-7 business days</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
