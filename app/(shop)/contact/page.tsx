"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";

export default function ContactPage() {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmitStatus('success');
                setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    return (
        <main className="min-h-screen bg-white pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-serif text-black mb-4">
                        {t('contact.title') || 'Contact Us'}
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {t('contact.subtitle') || 'Have questions? We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Contact Cards */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black mb-1">Email</h3>
                                    <a href="mailto:support@yemeni-market.com" className="text-gray-600 hover:text-black transition-colors">
                                        support@yemeni-market.com
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black mb-1">Phone</h3>
                                    <a href="tel:+33666336860" className="text-gray-600 hover:text-black transition-colors">
                                        +33 6 66 33 68 60
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black mb-1">Address</h3>
                                    <p className="text-gray-600">
                                        Paris, France
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-black mb-1">Business Hours</h3>
                                    <p className="text-gray-600 text-sm">
                                        Monday - Friday: 9:00 AM - 6:00 PM<br />
                                        Saturday: 10:00 AM - 4:00 PM<br />
                                        Sunday: Closed
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-gray-200 rounded-xl p-8">
                            <h2 className="text-2xl font-serif text-black mb-6">Send us a Message</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('contact.name') || 'Full Name'} *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('contact.email') || 'Email Address'} *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('contact.phone') || 'Phone Number'}
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                            placeholder="+33 6 12 34 56 78"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">
                                            {t('contact.subject') || 'Subject'} *
                                        </label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="order">Order Question</option>
                                            <option value="product">Product Information</option>
                                            <option value="shipping">Shipping & Delivery</option>
                                            <option value="wholesale">Wholesale Inquiry</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        {t('contact.message') || 'Message'} *
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                                        placeholder="Tell us how we can help you..."
                                    />
                                </div>

                                {submitStatus === 'success' && (
                                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                                        ✅ Message sent successfully! We'll get back to you soon.
                                    </div>
                                )}

                                {submitStatus === 'error' && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                        ❌ Failed to send message. Please try again or email us directly.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white py-4 rounded-lg font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <Send className="w-5 h-5" />
                                            {t('contact.send') || 'Send Message'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
