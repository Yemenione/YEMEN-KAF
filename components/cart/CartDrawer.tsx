"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeFromCart, total } = useCart();

    return (
        <>
            {/* Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-500",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={closeCart}
            />

            {/* Drawer Panel */}
            <div
                className={clsx(
                    "fixed top-0 right-0 h-full w-full max-w-md bg-[var(--cream-white)] border-l border-[var(--coffee-brown)]/10 shadow-2xl z-[70] transform transition-transform duration-500 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-6 border-b border-[var(--coffee-brown)]/10 flex items-center justify-between">
                    <h2 className="text-2xl font-serif text-[var(--coffee-brown)]">Your Selection</h2>
                    <button onClick={closeCart} className="text-[var(--coffee-brown)]/60 hover:text-[var(--honey-gold)] transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--coffee-brown)]/40 space-y-4">
                            <ShoppingBag size={48} />
                            <p className="text-lg">Your cart is empty</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4 p-4 bg-[var(--coffee-brown)]/5 rounded-lg border border-[var(--coffee-brown)]/5">
                                <div className="relative w-20 h-20 rounded-md overflow-hidden bg-white">
                                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-serif text-[var(--coffee-brown)]">{item.title}</h3>
                                        <button onClick={() => removeFromCart(item.id)} className="text-[var(--coffee-brown)]/40 hover:text-red-400">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <p className="text-[var(--coffee-brown)]/80 text-sm mt-1">{item.price}</p>

                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[var(--coffee-brown)]/60 text-xs uppercase tracking-wider">Qty: {item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-6 bg-[var(--cream-white)] border-t border-[var(--coffee-brown)]/10 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[var(--coffee-brown)]/60 uppercase tracking-widest text-sm">Subtotal</span>
                            <span className="text-3xl font-serif text-[var(--coffee-brown)]">${total.toFixed(2)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[var(--coffee-brown)]/60 text-xs justify-center pb-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Concierge Gift Wrapping Available
                        </div>

                        <Link href="/checkout" onClick={closeCart} className="block w-full text-center py-4 bg-[var(--honey-gold)] text-[var(--coffee-brown)] font-bold uppercase tracking-widest hover:bg-[var(--coffee-brown)]/90 transition-colors shadow-lg">
                            Checkout Securely
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
