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
                <div className="prose prose-lg text-gray-600">
                    <p>Last Updated: {new Date().toLocaleDateString()}</p>

                    <h2 className="text-2xl font-serif text-black mt-8 mb-4">1. Introduction</h2>
                    <p>Welcome to Yemeni Market. By accessing our website and purchasing our products, you agree to be bound by these Terms of Service.</p>

                    <h2 className="text-2xl font-serif text-black mt-8 mb-4">2. Products & Services</h2>
                    <p>We strive to display our products as accurately as possible. However, due to screen differences and the natural origin of our products (honey, coffee), slight variations may occur.</p>

                    <h2 className="text-2xl font-serif text-black mt-8 mb-4">3. Purchases</h2>
                    <p>All purchases are subject to availability. We reserve the right to limit quantities of any products or services that we offer.</p>

                    <h2 className="text-2xl font-serif text-black mt-8 mb-4">4. Shipping & Returns</h2>
                    <p>Please refer to our Shipping Policy for detailed information on delivery times and return eligibility.</p>
                </div>
            </div>
            <Footer />
        </main>
    );
}
