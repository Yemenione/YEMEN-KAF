"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AccountDashboard() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    return (
        <div className="bg-white pb-32">
            <div className="pt-4">
                {/* Profile Info */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                        <div className="w-24 h-24 rounded-full border-4 border-[#F9F6F1] shadow-xl overflow-hidden relative">
                            {/* Placeholder Avatar - Replace with user.avatar if available */}
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-3xl font-serif text-[var(--coffee-brown)]">
                                {user?.firstName?.charAt(0) || "U"}
                            </div>
                        </div>
                        <Link href="/account/profile" className="absolute bottom-0 right-0 bg-[#E3C069] text-white p-1.5 rounded-full border-2 border-white shadow-md hover:scale-110 transition-transform">
                            <Settings size={12} />
                        </Link>
                    </div>
                    <h2 className="text-xl font-serif text-black mb-2">
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <div className="bg-[#FFF8E1] text-[#D4AF37] px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-[#FBEFB8] flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-[#D4AF37]"></span>
                        {t('account.goldMember') || "MEMBRE GOLD"}
                    </div>
                </div>

                {/* Loyalty Card */}
                <div className="w-full bg-gradient-to-br from-[#E3C069] to-[#Cca040] rounded-[2rem] p-8 mb-10 text-white shadow-lg relative overflow-hidden group">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/5 rounded-full blur-xl"></div>

                    <div className="relative z-10">
                        <h3 className="text-4xl font-serif mb-1">1250 <span className="text-lg font-sans font-medium opacity-80">pts</span></h3>
                        <p className="text-[10px] uppercase tracking-[0.2em] opacity-80 mb-6">
                            {t('account.loyaltyPoints') || "POINTS FIDÉLITÉ YEMEN KAF"}
                        </p>

                        <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wide border border-white/30">
                            {t('account.viewRewards') || "Voir les récompenses"}
                        </button>
                    </div>
                </div>

                {/* Recent Activity Placeholder or Clean space */}
                <div className="text-center">
                    <p className="text-gray-400 text-sm italic">
                        {t('account.welcomeMessage') || "Bienvenue sur votre espace personnel."}
                    </p>
                </div>
            </div>
        </div>
    );
}
