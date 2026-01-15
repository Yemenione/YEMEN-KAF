"use client";

import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CreditCard, MapPin, Truck } from "lucide-react";

export default function CheckoutPage() {
    const { items, total } = useCart();
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-[var(--cream-white)] pt-32 pb-20 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">

                {/* Left Column: Forms */}
                <div className="space-y-12">
                    <Link href="/shop" className="flex items-center gap-2 text-[var(--coffee-brown)]/60 hover:text-[var(--honey-gold)] transition-colors text-sm uppercase tracking-widest">
                        <ArrowLeft size={16} /> Back to Shop
                    </Link>

                    <div>
                        <h1 className="text-4xl font-serif text-[var(--coffee-brown)] mb-2">{t("cart.checkout")}</h1>
                        <p className="text-[var(--coffee-brown)]/60">Complete your order details below.</p>
                    </div>

                    {/* Shipping Form */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 text-[var(--honey-gold)] border-b border-[var(--coffee-brown)]/10 pb-4">
                            <MapPin />
                            <h2 className="text-xl font-serif text-[var(--coffee-brown)]">Shipping Address</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/70">First Name</label>
                                <input type="text" className="w-full bg-[var(--coffee-brown)]/5 border border-[var(--coffee-brown)]/10 p-4 rounded-none focus:border-[var(--honey-gold)] outline-none transition-colors text-[var(--coffee-brown)]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/70">Last Name</label>
                                <input type="text" className="w-full bg-[var(--coffee-brown)]/5 border border-[var(--coffee-brown)]/10 p-4 rounded-none focus:border-[var(--honey-gold)] outline-none transition-colors text-[var(--coffee-brown)]" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/70">Address</label>
                                <input type="text" className="w-full bg-[var(--coffee-brown)]/5 border border-[var(--coffee-brown)]/10 p-4 rounded-none focus:border-[var(--honey-gold)] outline-none transition-colors text-[var(--coffee-brown)]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/70">City</label>
                                <input type="text" className="w-full bg-[var(--coffee-brown)]/5 border border-[var(--coffee-brown)]/10 p-4 rounded-none focus:border-[var(--honey-gold)] outline-none transition-colors text-[var(--coffee-brown)]" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-wider text-[var(--coffee-brown)]/70">Country</label>
                                <select className="w-full bg-[var(--coffee-brown)]/5 border border-[var(--coffee-brown)]/10 p-4 rounded-none focus:border-[var(--honey-gold)] outline-none transition-colors text-[var(--coffee-brown)] appearance-none">
                                    <option>Yemen</option>
                                    <option>Saudi Arabia</option>
                                    <option>UAE</option>
                                    <option>France</option>
                                    <option>USA</option>
                                </select>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:pl-12">
                    <div className="bg-[var(--coffee-brown)] p-8 md:p-12 text-[var(--cream-white)] sticky top-32">
                        <h2 className="text-2xl font-serif text-[var(--honey-gold)] mb-8">Order Summary</h2>

                        <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-16 bg-[var(--cream-white)]/10 rounded overflow-hidden flex-shrink-0">
                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-serif text-lg leading-tight">{item.title}</h3>
                                        <span className="text-[var(--honey-gold)] text-sm">{item.price} x {item.quantity}</span>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && <p className="opacity-50 italic">Your cart is empty.</p>}
                        </div>

                        <div className="space-y-4 border-t border-[var(--honey-gold)]/20 pt-6 mb-8">
                            <div className="flex justify-between text-sm opacity-70">
                                <span>Subtotal</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-70">
                                <span>Shipping</span>
                                <span>Calculated next step</span>
                            </div>
                            <div className="flex justify-between text-xl font-serif text-[var(--honey-gold)] pt-4 border-t border-[var(--honey-gold)]/20">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-[var(--honey-gold)] text-[var(--coffee-brown)] font-bold uppercase tracking-widest hover:bg-[#D4AF37] transition-colors shadow-lg">
                            Proceed to Payment
                        </button>
                    </div>
                </div>

            </div>
        </main>
    );
}
