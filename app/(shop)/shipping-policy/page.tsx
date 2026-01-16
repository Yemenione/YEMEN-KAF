"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useLanguage } from "@/context/LanguageContext";

export default function ShippingPolicyPage() {
    const { t } = useLanguage();

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-serif mb-8 text-black">Shipping Policy</h1>
                <div className="prose prose-lg text-gray-700 space-y-6">
                    <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">Shipping Methods</h2>
                        <p>We offer two shipping options:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-2">
                            <li><strong>Standard Shipping (Free):</strong> 5-7 business days</li>
                            <li><strong>Express Shipping (€25):</strong> 2-3 business days</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">Delivery Areas</h2>
                        <p>We currently ship to all countries within the European Union. International shipping outside the EU may be available upon request.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">Processing Time</h2>
                        <p>Orders are processed within 1-2 business days. You will receive a tracking number via email once your order has shipped.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">Customs and Import Duties</h2>
                        <p>For orders shipped outside France, customers are responsible for any customs fees, import duties, or taxes imposed by their country.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">Damaged or Lost Packages</h2>
                        <p>If your package arrives damaged or is lost in transit, please contact us within 48 hours at <a href="mailto:contact@yemeni-market.com" className="text-[var(--honey-gold)] underline">contact@yemeni-market.com</a>. We will work with the carrier to resolve the issue.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">Returns</h2>
                        <p>Due to the nature of our food products (honey, coffee, spices), we can only accept returns for damaged or defective items. Please refer to our <a href="/terms" className="text-[var(--honey-gold)] underline">Terms of Service</a> for our full return policy.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">Contact Us</h2>
                        <p>For shipping inquiries, contact us at:</p>
                        <p className="mt-2">Email: <a href="mailto:contact@yemeni-market.com" className="text-[var(--honey-gold)] underline">contact@yemeni-market.com</a> | Phone: +33 6 66 33 68 60</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
