"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { MoveLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />

            <main className="flex-grow flex items-center justify-center px-6 pt-20">
                <div className="max-w-2xl w-full text-center space-y-12">
                    {/* Visual Element */}
                    <div className="relative h-64 md:h-80 w-full group">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[12rem] md:text-[18rem] font-serif text-[var(--coffee-brown)]/5 select-none italic">404</span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700">
                            <Image
                                src="/images/logo.png"
                                alt="Yemen Kaf Logo"
                                width={150}
                                height={150}
                                className="opacity-20 grayscale"
                            />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h1 className="text-3xl md:text-5xl font-serif text-[var(--coffee-brown)]">Trésor Introuvable</h1>
                        <p className="text-[var(--coffee-brown)]/60 text-lg md:text-xl max-w-md mx-auto italic font-light">
                            Il semble que cette caravane ait pris un chemin inattendu à travers les vallées.
                            L'article que vous cherchez n'est pas ici.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full hover:bg-[var(--coffee-brown)] transition-all duration-300 font-bold uppercase tracking-widest text-xs"
                        >
                            <MoveLeft size={16} />
                            Retour à l'Accueil
                        </Link>
                        <Link
                            href="/shop"
                            className="px-8 py-4 border border-black/10 text-black rounded-full hover:bg-black hover:text-white transition-all duration-300 font-bold uppercase tracking-widest text-xs"
                        >
                            Explorer la Boutique
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
