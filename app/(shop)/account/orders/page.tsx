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

import { Download, Box, CheckCircle, Clock, Truck } from "lucide-react";

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

    const handleDownloadInvoice = (orderId: number) => {
        window.open(`/api/account/orders/${orderId}/invoice`, '_blank');
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getTranslatedStatus = (status: string) => {
        const map: Record<string, string> = {
            'pending': 'En attente',
            'processing': 'En cours',
            'shipped': 'Expédié',
            'delivered': 'Livré',
            'cancelled': 'Annulé'
        };
        return map[status.toLowerCase()] || status;
    };

    const formatAddress = (addressJson: string) => {
        if (!addressJson) return t('orders.notSpecified');
        try {
            const addr = JSON.parse(addressJson);
            return `${addr.address || ''}, ${addr.zip || ''} ${addr.city || ''}`;
        } catch {
            return addressJson;
        }
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
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleDownloadInvoice(order.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
                                    >
                                        <Download size={14} /> Facture
                                    </button>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(order.status)} flex items-center gap-1.5`}>
                                        {/* Status Icon */}
                                        {order.status === 'delivered' ? <CheckCircle size={14} /> :
                                            order.status === 'shipped' ? <Truck size={14} /> :
                                                order.status === 'processing' ? <Box size={14} /> : <Clock size={14} />}
                                        {getTranslatedStatus(order.status)}
                                    </span>
                                </div>
                            </div>

                            {/* Tracking Timeline (Visual Only for now) */}
                            <div className="relative mb-6 px-2">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
                                <div className="flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                    <div className={`bg-white px-1 flex flex-col items-center gap-1 ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'text-green-600' : ''}`}>
                                        <div className={`w-3 h-3 rounded-full ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                                        Validée
                                    </div>
                                    <div className={`bg-white px-1 flex flex-col items-center gap-1 ${['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'text-blue-600' : ''}`}>
                                        <div className={`w-3 h-3 rounded-full ${['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
                                        Préparation
                                    </div>
                                    <div className={`bg-white px-1 flex flex-col items-center gap-1 ${['shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'text-purple-600' : ''}`}>
                                        <div className={`w-3 h-3 rounded-full ${['shipped', 'delivered'].includes(order.status.toLowerCase()) ? 'bg-purple-500' : 'bg-gray-200'}`}></div>
                                        Expédiée
                                    </div>
                                    <div className={`bg-white px-1 flex flex-col items-center gap-1 ${['delivered'].includes(order.status.toLowerCase()) ? 'text-green-700' : ''}`}>
                                        <div className={`w-3 h-3 rounded-full ${['delivered'].includes(order.status.toLowerCase()) ? 'bg-green-700' : 'bg-gray-200'}`}></div>
                                        Livrée
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3">{t('orders.products') || "Articles"}</h4>
                                <ul className="space-y-3">
                                    {order.items.map((item, idx) => {
                                        // Parse "Name xQty (Price)"
                                        const parts = item.match(/^(.*) x(\d+) \((.*)\)$/);
                                        const name = parts ? parts[1] : item;
                                        const qty = parts ? parts[2] : '';
                                        const price = parts ? parts[3] : '';

                                        return (
                                            <li key={idx} className="flex justify-between items-center text-sm">
                                                <span className="font-medium text-gray-700 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-black/20"></span>
                                                    {name}
                                                </span>
                                                <span className="text-gray-500 text-xs bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                                    Quantity: {qty} • {price}
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <div className="text-xs text-gray-500 max-w-[60%]">
                                    <span className="font-bold text-gray-700 uppercase tracking-wider block mb-1">{t('orders.address') || "Lieu de livraison"}</span>
                                    {formatAddress(order.shippingAddress)}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-gray-400 mb-0.5">{t('orders.total')}</p>
                                    <p className="text-2xl font-serif font-bold text-black border-b-2 border-[#E3C069] inline-block leading-none pb-1">
                                        {Number(order.totalAmount).toFixed(2)}€
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                    }
                </div >
            )}
        </div >
    );
}
