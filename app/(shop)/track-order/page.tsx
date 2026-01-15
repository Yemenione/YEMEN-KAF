"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Search } from "lucide-react";
import { useState } from "react";

export default function TrackOrderPage() {
    const { t } = useLanguage();
    const [orderId, setOrderId] = useState("");
    const [status, setStatus] = useState<null | string>(null);

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock Logic
        setStatus("Processing at Warehouse");
    };

    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
            <div className="max-w-md w-full space-y-12 animate-fade-in-up text-center">

                <div className="space-y-4">
                    <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.3em]">Concierge Service</span>
                    <h1 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)]">Track Order</h1>
                    <p className="text-[var(--coffee-brown)]/60 text-sm leading-relaxed">
                        Enter your order number below to check the status of your shipment.
                    </p>
                </div>

                <form onSubmit={handleTrack} className="space-y-6 relative">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Order # (e.g. YEM-8592)"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="w-full border-b border-[var(--coffee-brown)]/20 py-4 text-center text-xl font-serif placeholder-[var(--coffee-brown)]/20 focus:border-[var(--coffee-brown)] outline-none bg-transparent transition-colors"
                        />
                        <Search className="absolute right-0 top-4 text-[var(--coffee-brown)]/20" size={20} />
                    </div>

                    <button type="submit" className="w-full py-4 bg-[var(--coffee-brown)] text-white font-bold uppercase tracking-widest text-xs hover:bg-[var(--coffee-brown)]/90 transition-colors">
                        Track Shipment
                    </button>
                </form>

                {status && (
                    <div className="p-6 bg-gray-50 border border-black/5 animate-fade-in">
                        <h3 className="text-xs uppercase tracking-widest text-[var(--coffee-brown)]/60 mb-2">Current Status</h3>
                        <p className="text-xl font-serif text-[var(--coffee-brown)]">{status}</p>
                    </div>
                )}
            </div>
        </main>
    );
}
