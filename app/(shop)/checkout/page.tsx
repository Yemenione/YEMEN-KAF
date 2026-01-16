"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, ChevronRight, ShoppingBag, MapPin, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";

export default function CheckoutPage() {
    const { items, total } = useCart();
    const { t } = useLanguage();
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "France"
    });
    const [selectedShippingMethod, setSelectedShippingMethod] = useState("standard");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if cart is empty
    useEffect(() => {
        if (items.length === 0) {
            router.push("/shop");
        }
    }, [items, router]);

    const formatPrice = (price: string | number) => {
        if (typeof price === 'number') return `${price.toFixed(2)}€`;
        return price;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingAddress: formData,
                    paymentMethod: 'cash_on_delivery', // Mock for now
                    shippingMethod: selectedShippingMethod,
                    items: items.map(item => ({ id: item.id, quantity: item.quantity }))
                })
            });

            if (res.ok) {
                const data = await res.json();
                router.push(`/order-confirmation/${data.orderNumber}`);
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert("An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12">

                {/* Left Column: Checkout Forms */}
                <div className="lg:col-span-7 space-y-16">
                    {/* Header */}
                    <div className="space-y-4 border-b border-black/10 pb-8">
                        <Link href="/shop" className="inline-flex items-center gap-2 text-gray-500 hover:text-black transition-colors text-xs uppercase tracking-widest font-medium">
                            <ArrowLeft size={14} /> {t('checkout.continueShopping')}
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-serif text-black">{t("checkout.title")}</h1>
                    </div>

                    {/* Step 1: Shipping */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium tracking-wide flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white text-sm font-bold">1</span>
                                {t('checkout.shippingDetails')}
                            </h2>
                            <button
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(() => {
                                            alert("Location Found! (Mock: Filled City/Country)");
                                            // In a real app, use Google Maps API or similar here
                                        }, () => alert("Location access denied."));
                                    }
                                }}
                                className="text-xs uppercase tracking-wider font-bold text-black border-b border-black pb-0.5 hover:text-gray-600 transition-colors flex items-center gap-1"
                            >
                                <MapPin size={12} /> {t('checkout.smartLocation')}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.firstName')}</label>
                                <input name="firstName" value={formData.firstName} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.lastName')}</label>
                                <input name="lastName" value={formData.lastName} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.email')}</label>
                                <input name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.phone')}</label>
                                <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>

                            <div className="md:col-span-2 group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.street')}</label>
                                <input name="address" value={formData.address} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>

                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.city')}</label>
                                <input name="city" value={formData.city} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.state')}</label>
                                <input name="state" value={formData.state} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.zip')}</label>
                                <input name="zip" value={formData.zip} onChange={handleInputChange} type="text" className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent placeholder-gray-300" placeholder="" />
                            </div>
                            <div className="group">
                                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-black transition-colors">{t('checkout.country')}</label>
                                <select name="country" value={formData.country} onChange={handleInputChange} className="w-full border-b border-gray-200 py-3 text-lg focus:border-black outline-none transition-colors bg-transparent appearance-none cursor-pointer">
                                    <option>Select Country</option>
                                    <option value="France">France</option>
                                    <option value="United Kingdom">United Kingdom</option>
                                    <option value="United States">United States</option>
                                    <option value="UAE">UAE</option>
                                    <option value="Saudi Arabia">Saudi Arabia</option>
                                    <option value="Yemen">Yemen</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Step 2: Delivery Options */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium tracking-wide flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-black text-black text-sm font-bold">2</span>
                                {t('checkout.deliveryMethod')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <label className="relative p-6 border rounded-xl cursor-pointer hover:border-black transition-all group">
                                <input
                                    type="radio"
                                    name="shipping"
                                    className="peer sr-only"
                                    checked={selectedShippingMethod === "standard"}
                                    onChange={() => setSelectedShippingMethod("standard")}
                                />
                                <div className="absolute inset-0 border-2 border-transparent peer-checked:border-black rounded-xl transition-all"></div>
                                <div className="relative flex items-center justify-between mb-2">
                                    <Truck className="w-6 h-6 text-gray-400 peer-checked:text-black" />
                                    <span className="font-bold text-lg">{t('checkout.free')}</span>
                                </div>
                                <h3 className="font-serif text-lg text-black mb-1">{t('checkout.standard')}</h3>
                                <p className="text-sm text-gray-500">5-7 {t('checkout.businessDays')}</p>
                            </label>

                            <label className="relative p-6 border rounded-xl cursor-pointer hover:border-black transition-all group">
                                <input
                                    type="radio"
                                    name="shipping"
                                    className="peer sr-only"
                                    checked={selectedShippingMethod === "express"}
                                    onChange={() => setSelectedShippingMethod("express")}
                                />
                                <div className="absolute inset-0 border-2 border-transparent peer-checked:border-black rounded-xl transition-all"></div>
                                <div className="relative flex items-center justify-between mb-2">
                                    <div className="p-1 bg-black text-white text-[10px] uppercase font-bold px-2 rounded">Express</div>
                                    <span className="font-bold text-lg">25.00€</span>
                                </div>
                                <h3 className="font-serif text-lg text-black mb-1">{t('checkout.express')}</h3>
                                <p className="text-sm text-gray-500">1-3 {t('checkout.businessDays')} (DHL/FedEx)</p>
                            </label>
                        </div>
                    </section>

                    {/* Step 3: Payment Mockup */}
                    <section className="space-y-8 opacity-50 pointer-events-none grayscale">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-medium tracking-wide flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full border border-black/20 text-black/50 text-sm font-bold">3</span>
                                {t('checkout.paymentMethod')}
                            </h2>
                        </div>
                        <div className="p-6 border border-gray-100 rounded-xl flex items-center gap-4">
                            <CreditCard className="w-6 h-6 text-gray-400" />
                            <span>Payment details will be collected securely in the next step.</span>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-5 relative">
                    <div className="sticky top-32 p-8 md:p-10 bg-gray-50 rounded-3xl">
                        <h2 className="text-2xl font-serif text-black mb-8 flex items-center gap-3">
                            <ShoppingBag className="w-5 h-5" /> {t('checkout.yourOrder')}
                        </h2>

                        <div className="space-y-6 mb-8 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.length === 0 ? (
                                <p className="text-gray-400 italic py-8 text-center">{t('checkout.emptyBag')}</p>
                            ) : (
                                items.map((item) => (
                                    <div key={item.id} className="flex gap-4 items-start pb-6 border-b border-black/5 last:border-0">
                                        <div className="relative w-20 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0 border border-black/5">
                                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-lg text-black truncate">{item.title}</h3>
                                            <p className="text-sm text-gray-500 mb-2">Qty: {item.quantity}</p>
                                            <p className="font-serif text-black">{formatPrice(item.price)}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-4 pt-6 border-t border-black/10">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{t('checkout.subtotal')}</span>
                                <span>{total.toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>{t('checkout.shipping')}</span>
                                <span>{selectedShippingMethod === "express" ? "25.00€" : t('checkout.free')}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-serif text-black pt-4">
                                <span>{t('checkout.total')}</span>
                                <span>{(total + (selectedShippingMethod === "express" ? 25 : 0)).toFixed(2)}€</span>
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`w-full mt-8 py-5 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-900 hover:scale-[1.02] transition-all duration-300 rounded-xl shadow-xl flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? t('checkout.processing') : t('checkout.processPayment')} <ChevronRight size={18} />
                        </button>

                        <p className="text-center text-xs text-gray-400 mt-4 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animation-pulse"></span> {t('checkout.secureCheckout')}
                        </p>
                    </div>
                </div>

            </div>
        </main>
    );
}
