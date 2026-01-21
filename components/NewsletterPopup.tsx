"use client";

import { useState, useEffect } from "react";
import { X, Mail, Check, ArrowRight } from "lucide-react";

export default function NewsletterPopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [email, setEmail] = useState("");
    const [accepted, setAccepted] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check local storage to see if user has already seen or subscribed
        const hasSubscribed = localStorage.getItem("newsletter_subscribed");
        const hasClosed = localStorage.getItem("newsletter_closed");
        const sessionClosed = sessionStorage.getItem("newsletter_session_closed");

        if (!hasSubscribed && !hasClosed && !sessionClosed) {
            const timer = setTimeout(() => setIsVisible(true), 8000); // Show after 8 seconds
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        sessionStorage.setItem("newsletter_session_closed", "true");
    };

    const handlePermanentClose = () => {
        setIsVisible(false);
        localStorage.setItem("newsletter_closed", "true");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && accepted) {
            // Visualize success state
            setSubmitted(true);
            localStorage.setItem("newsletter_subscribed", "true");

            // Here you would typically send the email to your backend API
            console.log("Newsletter subscription:", email);

            // Close after showing success message
            setTimeout(() => {
                setIsVisible(false);
            }, 3000);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative w-full max-w-md bg-[#111] border border-[var(--honey-gold)]/30 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                    aria-label="Fermer"
                >
                    <X size={20} />
                </button>

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--honey-gold)] to-transparent opacity-50"></div>

                <div className="p-8 md:p-10 text-center">
                    {!submitted ? (
                        <>
                            <div className="w-16 h-16 mx-auto mb-6 bg-[var(--honey-gold)]/10 rounded-full flex items-center justify-center border border-[var(--honey-gold)]/20">
                                <Mail className="w-8 h-8 text-[var(--honey-gold)]" />
                            </div>

                            <h3 className="text-2xl font-playfair text-[var(--cream-white)] mb-3">
                                Rejoignez l&apos;Excellence
                            </h3>

                            <p className="text-gray-400 text-sm mb-8 leading-relaxed font-light">
                                Inscrivez-vous à notre newsletter pour recevoir nos offres exclusives et découvrir nos nouveautés en avant-première.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Votre adresse email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-[var(--cream-white)] placeholder-gray-500 focus:outline-none focus:border-[var(--honey-gold)] focus:ring-1 focus:ring-[var(--honey-gold)] transition-all text-sm"
                                    />
                                </div>

                                <div className="flex items-start gap-3 group cursor-pointer" onClick={() => setAccepted(!accepted)}>
                                    <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${accepted ? "bg-[var(--honey-gold)] border-[var(--honey-gold)]" : "border-gray-600 group-hover:border-gray-500"}`}>
                                        {accepted && <Check size={12} className="text-black" />}
                                    </div>
                                    <label className="text-xs text-gray-500 cursor-pointer select-none leading-tight">
                                        J&apos;accepte de recevoir des emails marketing et je confirme avoir lu la <a href="/privacy" className="underline text-[var(--honey-gold)] hover:text-[#D4AF37]" onClick={(e) => e.stopPropagation()}>politique de confidentialité</a>.
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    disabled={!accepted || !email}
                                    className={`w-full py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold uppercase text-xs tracking-widest transition-all ${accepted && email
                                        ? "bg-[var(--honey-gold)] text-black hover:bg-[#D4AF37] shadow-[0_4px_20px_rgba(197,160,89,0.2)]"
                                        : "bg-gray-800 text-gray-500 cursor-not-allowed"
                                        }`}
                                >
                                    S&apos;inscrire
                                    <ArrowRight size={16} />
                                </button>
                            </form>

                            <button
                                onClick={handlePermanentClose}
                                className="mt-6 text-xs text-gray-600 hover:text-gray-400 underline decoration-gray-700 underline-offset-4"
                            >
                                Ne plus afficher ce message
                            </button>
                        </>
                    ) : (
                        <div className="py-10 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-playfair text-[var(--cream-white)] mb-2">
                                Merci de votre inscription !
                            </h3>
                            <p className="text-gray-400 text-sm">
                                Vous faites désormais partie de notre communauté privilégiée.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
