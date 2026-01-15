"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useParams } from "next/navigation";

export default function OrderConfirmationPage() {
    const { orderNumber } = useParams();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-[var(--honey-gold)]/20 text-[var(--honey-gold)] flex items-center justify-center animate-bounce-slow">
                        <CheckCircle size={48} />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-serif text-black mb-6">Order Confirmed!</h1>
                <p className="text-lg text-gray-500 mb-2">Thank you for your purchase.</p>
                <p className="text-sm text-gray-400 mb-12">Your order number is <span className="text-black font-bold font-mono">{orderNumber}</span></p>

                <div className="bg-gray-50 rounded-2xl p-8 mb-12 border border-black/5">
                    <p className="text-sm text-gray-600 mb-4">We've sent a confirmation email to your inbox.</p>
                    <p className="text-sm text-gray-600">Your authentic Yemeni treasures are being prepared with care and will be shipped soon.</p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link
                        href="/shop"
                        className="w-full md:w-auto px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-900 transition-all rounded-xl flex items-center justify-center gap-2"
                    >
                        Continue Shopping <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/account/orders"
                        className="w-full md:w-auto px-8 py-4 border border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-xl flex items-center justify-center gap-2"
                    >
                        View My Orders <ShoppingBag size={18} />
                    </Link>
                </div>
            </div>
        </main>
    );
}
