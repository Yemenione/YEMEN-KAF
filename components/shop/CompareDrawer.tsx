"use client";

import React from 'react';
import { useCompare } from '@/context/CompareContext';
import { useLanguage } from '@/context/LanguageContext';
import { X, RefreshCw, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function CompareDrawer() {
    const { compareItems, removeFromCompare, clearCompare } = useCompare();
    const { t } = useLanguage();

    if (compareItems.length === 0) return null;

    return (
        <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="bg-black text-white rounded-2xl shadow-2xl p-4 md:p-6 overflow-hidden border border-white/10 backdrop-blur-xl"
            >
                <div className="flex flex-col md:flex-row items-center gap-6">
                    {/* Header Info */}
                    <div className="flex flex-col gap-1 min-w-[120px]">
                        <div className="flex items-center gap-2">
                            <RefreshCw size={16} className="text-[#E3C069] animate-spin-slow" />
                            <span className="font-bold uppercase tracking-widest text-xs">
                                {t('shop.compare')} ({compareItems.length}/4)
                            </span>
                        </div>
                        <button
                            onClick={clearCompare}
                            className="text-[10px] text-gray-400 hover:text-white uppercase tracking-tighter text-left"
                        >
                            {t('admin.common.delete') || 'Clear All'}
                        </button>
                    </div>

                    {/* Products List */}
                    <div className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                        <AnimatePresence>
                            {compareItems.map((item) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="relative flex-shrink-0 group"
                                >
                                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/10 overflow-hidden border border-white/5 relative">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeFromCompare(item.id)}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Placeholder slots */}
                        {[...Array(Math.max(0, 2 - compareItems.length))].map((_, i) => (
                            <div key={`empty-${i}`} className="w-14 h-14 md:w-16 md:h-16 rounded-xl border border-dashed border-white/20 flex items-center justify-center">
                                <Plus size={16} className="text-white/20" />
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <Link
                        href="/compare"
                        className={compareItems.length < 2 ? "opacity-50 pointer-events-none cursor-not-allowed" : ""}
                    >
                        <button
                            disabled={compareItems.length < 2}
                            className="px-6 py-3 bg-[#E3C069] text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#d4b05a] transition-all shadow-lg flex items-center gap-2 group whitespace-nowrap"
                        >
                            {t('shop.compare') || 'Compare Now'}
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}

function Plus({ size, className }: { size: number, className: string }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
