"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface Order {
    id: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    shippingAddress: string;
    items: string[];
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/account/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders);
            }
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTranslatedStatus = (status: string) => {
        const key = `account.status.${status.toLowerCase()}` as any;
        return t(key) || status;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-gray-500">{t('shop.loading')}</div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-black mb-2">{t('orders.title')}</h1>
                <p className="text-gray-500">{t('orders.subtitle')}</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-lg mb-4">{t('orders.noOrders')}</p>
                    <p className="text-gray-400">{t('orders.startShopping')}</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-serif text-xl text-black">{t('account.order')} #{order.id}</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(order.createdAt).toLocaleDateString(typeof window !== 'undefined' ? localStorage.getItem('locale') || 'en' : 'en', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                    {getTranslatedStatus(order.status)}
                                </span>
                            </div>

                            <div className="space-y-2 mb-4">
                                <h4 className="text-sm font-medium text-gray-700">{t('orders.products')}:</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>• {item}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">{t('orders.address')}:</span> {order.shippingAddress || t('orders.notSpecified')}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">{t('orders.total')}</p>
                                    <p className="text-xl font-serif text-black">{Number(order.totalAmount).toFixed(2)}€</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
