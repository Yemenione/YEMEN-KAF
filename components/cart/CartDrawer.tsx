"use client";

import { useCart } from "@/context/CartContext";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export default function CartDrawer() {
    const { items, isOpen, closeCart, removeFromCart, total } = useCart();

    const formatPrice = (price: string | number) => {
        if (typeof price === 'number') return `$${price.toFixed(2)}`;
        return price;
    };

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
                    "fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] transform transition-transform duration-500 ease-in-out flex flex-col",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-8 border-b border-black/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif text-black">Your Bag</h2>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{items.length} Items</span>
                    </div>
                    <button onClick={closeCart} className="text-black hover:rotate-90 transition-transform duration-300">
                        <X size={24} />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-6">
                            <ShoppingBag size={64} strokeWidth={1} />
                            <p className="text-xl font-serif italic text-gray-400">Your selection is empty</p>
                            <button onClick={closeCart} className="text-xs uppercase tracking-widest font-bold text-black border-b border-black pb-1 hover:text-gray-600">Start Shopping</button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-6 group">
                                <Link href={`/shop/${item.id}`} onClick={closeCart} className="relative w-24 h-32 flex-shrink-0 bg-gray-50 overflow-hidden rounded-sm transition-transform group-hover:scale-105 duration-500">
                                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                                </Link>
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-serif text-lg text-black truncate group-hover:text-gray-600 transition-colors">
                                            <Link href={`/shop/${item.id}`} onClick={closeCart}>{item.title}</Link>
                                        </h3>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-black transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Quantity: {item.quantity}</p>
                                    <p className="font-serif text-black">{formatPrice(item.price)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-8 bg-gray-50 space-y-6">
                        <div className="flex justify-between items-end border-b border-black/5 pb-6">
                            <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Subtotal</span>
                            <span className="text-3xl font-serif text-black">${total.toFixed(2)}</span>
                        </div>

                        <div className="space-y-4">
                            <Link
                                href="/checkout"
                                onClick={closeCart}
                                className="flex items-center justify-center gap-3 w-full py-5 bg-black text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-gray-900 transition-all shadow-xl hover:shadow-black/20"
                            >
                                Secure Checkout <ArrowRight size={14} />
                            </Link>

                            <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                Complimentary Shipping Included
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
