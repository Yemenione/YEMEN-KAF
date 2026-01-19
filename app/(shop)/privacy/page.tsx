"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function PrivacyPage() {

    return (
        <main className="min-h-screen bg-white">
            <Navbar />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-serif mb-8 text-black">Privacy Policy</h1>
                <div className="prose prose-lg text-gray-700 space-y-6">
                    <p className="text-sm text-gray-500">Last Updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">1. Introduction</h2>
                        <p>We respect your privacy and are committed to protecting your personal data in accordance with GDPR (General Data Protection Regulation). This policy explains how we collect, use, and safeguard your information.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">2. Data We Collect</h2>
                        <p>We collect the following types of personal data:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li><strong>Identity Data:</strong> Name, email address, phone number</li>
                            <li><strong>Contact Data:</strong> Billing and shipping addresses</li>
                            <li><strong>Transaction Data:</strong> Order history, payment details (processed securely via Stripe)</li>
                            <li><strong>Technical Data:</strong> IP address, browser type, device information</li>
                            <li><strong>Usage Data:</strong> How you interact with our website</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">3. How We Use Your Data</h2>
                        <p>We use your personal data to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Process and fulfill your orders</li>
                            <li>Communicate with you about your orders and account</li>
                            <li>Improve our website and services</li>
                            <li>Comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">4. Cookies</h2>
                        <p>Our website uses cookies to enhance your browsing experience. We use essential cookies for site functionality and analytics cookies to understand how you use our site. You can manage cookie preferences through your browser settings.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">5. Data Security</h2>
                        <p>We implement appropriate security measures to protect your personal data. Payment information is processed securely through Stripe and is never stored on our servers.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">6. Your Rights (GDPR)</h2>
                        <p>Under GDPR, you have the right to:</p>
                        <ul className="list-disc pl-6 mt-2 space-y-1">
                            <li>Access your personal data</li>
                            <li>Rectify inaccurate data</li>
                            <li>Request deletion of your data</li>
                            <li>Object to data processing</li>
                            <li>Data portability</li>
                        </ul>
                        <p className="mt-4">To exercise these rights, contact us at <a href="mailto:privacy@yemeni-market.com" className="text-[var(--honey-gold)] underline">privacy@yemeni-market.com</a></p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">7. Data Retention</h2>
                        <p>We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy or as required by law.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">8. Third-Party Services</h2>
                        <p>We use third-party services including Stripe (payment processing) and Google Analytics (website analytics). These services have their own privacy policies.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif text-black mt-8 mb-4">9. Contact Us</h2>
                        <p>For privacy-related inquiries, contact us at:</p>
                        <p className="mt-2">Email: <a href="mailto:privacy@yemeni-market.com" className="text-[var(--honey-gold)] underline">privacy@yemeni-market.com</a> | Phone: +33 6 66 33 68 60</p>
                    </section>
                </div>
            </div>
            <Footer />
        </main>
    );
}
