"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function TermsPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-serif mb-8 text-black">Terms of Service</h1>
                <div className="prose prose-lg text-gray-700 space-y-6">
                    <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">1. Introduction</h2>
                        <p>Welcome to Yemeni Market. By accessing our website and purchasing our products, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">2. Products & Services</h2>
                        <p>We offer authentic Yemeni products including honey, coffee, spices, and traditional goods. All product descriptions and prices are subject to change without notice. We reserve the right to limit quantities and refuse service.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">3. Orders and Payment</h2>
                        <p>By placing an order, you make an offer to purchase. We accept Credit/Debit Cards and Cash on Delivery (select regions). Payment must be made in full before shipment.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">4. Shipping & Returns</h2>
                        <p>Shipping times vary by location. Due to the nature of food products, we only accept returns for damaged or defective items within 48 hours of delivery. Refunds processed within 7-14 business days.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">5. Intellectual Property</h2>
                        <p>All content on this website is protected by copyright laws. Unauthorized use is prohibited.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">6. Governing Law</h2>
                        <p>These Terms are governed by French law. Any disputes shall be resolved in French courts.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">7. Contact</h2>
                        <p>Email: <a href="mailto:contact@yemeni-market.com" className="text-[var(--honey-gold)] underline">contact@yemeni-market.com</a> | Phone: +33 6 66 33 68 60</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
