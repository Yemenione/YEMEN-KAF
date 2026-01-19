"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle, ShoppingBag, ArrowRight, Package, Truck, CreditCard } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { useParams } from "next/navigation";

interface OrderItem {
    id: number;
    productId: number;
    name: string;
    slug: string;
    images: string[];
    quantity: number;
    price: number;
}

interface ShippingAddress {
    firstName?: string;
    lastName?: string;
    address?: string;
    apartment?: string;
    postalCode?: string;
    city?: string;
    country?: string;
    phone?: string;
    email?: string;
}

interface OrderDetails {
    id: number;
    orderNumber: string;
    status: string;
    totalAmount: number;
    shippingCost: number;
    shippingMethod: string;
    paymentMethod: string;
    shippingAddress: ShippingAddress;
    createdAt: string;
    items: OrderItem[];
}

export default function OrderConfirmationPage() {
    const { orderNumber } = useParams();
    const [mounted, setMounted] = useState(false);
    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);

        if (orderNumber) {
            fetch(`/api/orders/${orderNumber}`)
                .then(res => {
                    if (!res.ok) throw new Error('Order not found');
                    return res.json();
                })
                .then(data => {
                    setOrder(data);
                    setLoading(false);
                })
                .catch(err => {
                    setError(err.message);
                    setLoading(false);
                });
        }
    }, [orderNumber]);

    if (!mounted) return null;

    if (loading) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
                    <p className="text-gray-500">Loading order details...</p>
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="max-w-3xl mx-auto px-6 pt-40 pb-20 text-center">
                    <h1 className="text-4xl font-serif text-black mb-6">Order Not Found</h1>
                    <p className="text-gray-500 mb-8">We couldn&apos;t find an order with this number.</p>
                    <Link
                        href="/shop"
                        className="inline-block px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-900 transition-all rounded-xl"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </main>
        );
    }

    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            <div className="max-w-4xl mx-auto px-6 pt-40 pb-20">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-[var(--honey-gold)]/20 text-[var(--honey-gold)] flex items-center justify-center">
                            <CheckCircle size={40} />
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif text-black mb-4">Order Confirmed!</h1>
                    <p className="text-lg text-gray-600 mb-2">Thank you for your purchase.</p>
                    <p className="text-sm text-gray-500">
                        Order Number: <span className="text-black font-bold font-mono">{order.orderNumber}</span>
                    </p>
                </div>

                {/* Order Details Grid */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    {/* Shipping Address */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-black/5">
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="text-[var(--honey-gold)]" size={24} />
                            <h2 className="text-lg font-bold text-black">Shipping Address</h2>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                            <p className="font-semibold">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                            <p>{order.shippingAddress?.address}</p>
                            {order.shippingAddress?.apartment && <p>{order.shippingAddress.apartment}</p>}
                            <p>{order.shippingAddress?.postalCode} {order.shippingAddress?.city}</p>
                            <p>{order.shippingAddress?.country}</p>
                            <p className="pt-2">{order.shippingAddress?.phone}</p>
                            <p>{order.shippingAddress?.email}</p>
                        </div>
                    </div>

                    {/* Payment & Shipping Method */}
                    <div className="bg-gray-50 rounded-xl p-6 border border-black/5">
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="text-[var(--honey-gold)]" size={24} />
                            <h2 className="text-lg font-bold text-black">Payment & Delivery</h2>
                        </div>
                        <div className="text-sm text-gray-700 space-y-3">
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Payment Method</p>
                                <p className="font-semibold capitalize">{order.paymentMethod?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Shipping Method</p>
                                <p className="font-semibold capitalize">{order.shippingMethod}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Order Status</p>
                                <p className="font-semibold capitalize text-[var(--honey-gold)]">{order.status}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white border border-black/10 rounded-xl p-6 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Package className="text-[var(--honey-gold)]" size={24} />
                        <h2 className="text-lg font-bold text-black">Order Items</h2>
                    </div>

                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {item.images && item.images.length > 0 ? (
                                        <Image
                                            src={item.images[0]}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package size={32} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-black mb-1">{item.name}</h3>
                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-black">€{(item.price * item.quantity).toFixed(2)}</p>
                                    <p className="text-xs text-gray-500">€{item.price.toFixed(2)} each</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-6 pt-6 border-t border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-black">€{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-black">
                                {order.shippingCost > 0 ? `€${order.shippingCost.toFixed(2)}` : 'Free'}
                            </span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                            <span className="text-black">Total</span>
                            <span className="text-black">€{order.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-[var(--honey-gold)]/10 rounded-xl p-6 mb-8 border border-[var(--honey-gold)]/20">
                    <p className="text-sm text-gray-700 mb-2">
                        📧 A confirmation email has been sent to <strong>{order.shippingAddress?.email}</strong>
                    </p>
                    <p className="text-sm text-gray-700">
                        Your authentic Yemeni treasures are being prepared with care and will be shipped soon.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    <Link
                        href="/shop"
                        className="w-full md:w-auto px-8 py-4 bg-black text-white font-bold uppercase tracking-widest hover:bg-gray-900 transition-all rounded-xl flex items-center justify-center gap-2"
                    >
                        Continue Shopping <ArrowRight size={18} />
                    </Link>
                    <Link
                        href="/account/orders"
                        className="w-full md:w-auto px-8 py-4 border border-black text-black font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all rounded-xl flex items-center justify-center gap-2"
                    >
                        View My Orders <ShoppingBag size={18} />
                    </Link>
                </div>
            </div>
        </main>
    );
}
