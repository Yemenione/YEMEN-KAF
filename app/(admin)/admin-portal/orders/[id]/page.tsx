"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Truck, CreditCard, Package, Calendar, Download, FileText, CheckCircle, Clock } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { settings } = useSettings();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`);
            const data = await res.json();
            setOrder(data.order);
        } catch (error) {
            console.error("Failed to load order", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (newStatus: string) => {
        if (!confirm(`Change order status to ${newStatus}?`)) return;
        setUpdating(true);
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchOrder(); // Reload to get updated history
            }
        } catch (error) {
            alert("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    const generatePDF = (type: 'invoice' | 'packing_slip') => {
        const doc = new jsPDF();

        // Brand Color: Coffee Brown #4A3B32
        const primaryColor = [74, 59, 50];

        // Header
        doc.setFontSize(22);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(type === 'invoice' ? 'INVOICE' : 'PACKING SLIP', 150, 20);

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text(settings.site_name, 14, 20);
        doc.setFontSize(10);
        doc.text(settings.store_address || '123 Spice Street, Paris, France', 14, 26);
        doc.text(settings.support_email, 14, 31);
        doc.text(settings.support_phone, 14, 36);

        // Info Block
        (doc as any).autoTable({
            startY: 45,
            head: [['Bill To', 'Ship To', 'Details']],
            body: [[
                `${order.first_name} ${order.last_name}\n${order.email}\n${order.phone || ''}`,
                `${JSON.parse(order.shipping_address).address}\n${JSON.parse(order.shipping_address).city}, ${JSON.parse(order.shipping_address).zip}`,
                `Order #: ${order.order_number}\nDate: ${new Date(order.created_at).toLocaleDateString()}\nStatus: ${order.status}`
            ]],
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60 } }
        });

        // Items Table
        const tableColumn = type === 'invoice'
            ? ["Item", "Quantity", "Unit Price", "Total"]
            : ["Item", "Quantity", "SKU", "Weight"]; // Packing slip differs

        const tableRows: any[] = [];

        order.items.forEach((item: any) => {
            const row = type === 'invoice'
                ? [
                    item.product_name,
                    item.quantity,
                    `${Number(item.price).toFixed(2)}€`,
                    `${Number(item.total_price).toFixed(2)}€`
                ]
                : [
                    item.product_name,
                    item.quantity,
                    item.sku || 'N/A',
                    item.weight ? `${item.weight}kg` : '-'
                ];
            tableRows.push(row);
        });

        (doc as any).autoTable({
            startY: (doc as any).lastAutoTable.finalY + 10,
            head: [tableColumn],
            body: tableRows,
            headStyles: { fillColor: primaryColor as any },
            styles: { fontSize: 10 }
        });

        // Totals (Invoice Only)
        if (type === 'invoice') {
            const finalY = (doc as any).lastAutoTable.finalY + 10;
            doc.text(`Subtotal: ${Number(order.subtotal || order.total_amount - order.shipping_cost).toFixed(2)}€`, 140, finalY);
            doc.text(`Shipping: ${Number(order.shipping_cost).toFixed(2)}€`, 140, finalY + 5);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total: ${Number(order.total_amount).toFixed(2)}€`, 140, finalY + 12);
        }

        doc.save(`${type}_${order.order_number}.pdf`);
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
    if (!order) return <div className="p-8 text-center">Order not found</div>;

    const shippingAddress = order.shipping_address ? JSON.parse(order.shipping_address) : {};

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <Link href="/admin-portal/orders" className="flex items-center gap-2 text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors">
                    <ArrowLeft size={18} /> Back to Orders
                </Link>
                <div className="flex gap-3">
                    <button
                        onClick={() => generatePDF('packing_slip')}
                        className="px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-md text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Package className="w-4 h-4" /> Packing Slip
                    </button>
                    <button
                        onClick={() => generatePDF('invoice')}
                        className="px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-md text-sm font-medium flex items-center gap-2 hover:bg-[#5a4635] transition-colors"
                    >
                        <FileText className="w-4 h-4" /> Download Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status & ID */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-3">
                                    #{order.order_number}
                                    <span className={`text-sm px-2 py-1 rounded-full border bg-gray-50 border-gray-200 text-gray-700 capitalize`}>
                                        {order.status}
                                    </span>
                                </h1>
                                <p className="text-gray-500 text-sm mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <select
                                    className="border rounded-md px-3 py-2 text-sm bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700"
                                    value={order.status}
                                    onChange={(e) => updateStatus(e.target.value)}
                                    disabled={updating}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="border-t border-gray-100 dark:border-zinc-800 py-6">
                            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-500">Timeline</h3>
                            <div className="relative pl-4 border-l-2 border-gray-100 dark:border-zinc-800 space-y-6">
                                {order.history?.map((h: any, i: number) => (
                                    <div key={h.id} className="relative">
                                        <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-[var(--honey-gold)] border-2 border-white dark:border-zinc-900"></div>
                                        <div>
                                            <p className="text-sm font-medium capitalize">{h.status}</p>
                                            <p className="text-xs text-gray-500">{new Date(h.created_at).toLocaleString()} • {h.created_by}</p>
                                        </div>
                                    </div>
                                ))}
                                {/* Initial Creation */}
                                <div className="relative">
                                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-gray-300 border-2 border-white dark:border-zinc-900"></div>
                                    <div>
                                        <p className="text-sm font-medium">Order Placed</p>
                                        <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider text-gray-500">Items ({order.items?.length || 0})</h3>
                        <div className="space-y-4">
                            {order.items?.map((item: any) => (
                                <div key={item.id} className="flex gap-4 items-center p-2 hover:bg-gray-50 dark:hover:bg-zinc-800/50 rounded-lg transition-colors">
                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden relative border flex items-center justify-center">
                                        {item.product_images ? (
                                            <div className="relative w-full h-full">
                                                {/* Parsing Logic */}
                                                {(() => {
                                                    let src = '';
                                                    try {
                                                        const parsed = JSON.parse(item.product_images);
                                                        src = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : '';
                                                    } catch {
                                                        src = item.product_images; // Fallback to raw string
                                                    }

                                                    if (!src || (!src.startsWith('http') && !src.startsWith('/'))) return <Package className="text-gray-400 w-6 h-6 m-auto" />;

                                                    return <img src={src} alt={item.product_name} className="w-full h-full object-cover" />;
                                                })()}
                                            </div>
                                        ) : <Package className="text-gray-400 w-6 h-6" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm">{item.product_name}</p>
                                        <p className="text-xs text-gray-500">SKU: {item.sku || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium">{Number(item.total_price).toFixed(2)}€</p>
                                        <p className="text-xs text-gray-500">{item.quantity} × {Number(item.price).toFixed(2)}€</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 dark:border-zinc-800 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span>{Number(order.subtotal || order.total_amount - order.shipping_cost).toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Shipping</span>
                                <span>{Number(order.shipping_cost).toFixed(2)}€</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed border-gray-200 dark:border-zinc-700">
                                <span>Total</span>
                                <span>{Number(order.total_amount).toFixed(2)}€</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Customer</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                                {order.first_name ? order.first_name[0] : 'G'}
                            </div>
                            <div>
                                <p className="font-medium">{order.first_name} {order.last_name}</p>
                                <Link href={`/admin-portal/customers/${order.customer_id}`} className="text-xs text-blue-500 hover:underline">
                                    View Profile
                                </Link>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-4"><span className="text-lg">@</span></div>
                                <span className="truncate">{order.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Truck className="w-4 h-4" />
                                <span>{order.phone || 'No phone'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4">Shipping Address</h3>
                        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{shippingAddress.first_name || order.first_name} {shippingAddress.last_name || order.last_name}</p>
                            <p>{shippingAddress.address}</p>
                            <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}</p>
                            <p>{shippingAddress.country}</p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6 shadow-sm">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-gray-500 mb-4 flex items-center justify-between">
                            Logistics
                            {order.shipping_method?.toLowerCase().includes('colissimo') && (
                                <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">Colissimo</span>
                            )}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Tracking Number</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Add tracking #"
                                        className="flex-1 px-3 py-2 text-xs border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                        defaultValue={order.tracking_number || ""}
                                        onBlur={async (e) => {
                                            const val = e.target.value;
                                            if (val === order.tracking_number) return;
                                            try {
                                                await fetch(`/api/orders/${order.id}`, {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ tracking_number: val })
                                                });
                                            } catch (err) { alert("Failed to update tracking"); }
                                        }}
                                    />
                                </div>
                            </div>

                            {!order.tracking_number ? (
                                <button
                                    className="w-full py-2 bg-[var(--coffee-brown)] text-white rounded-md text-xs font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                                    onClick={async () => {
                                        if (!confirm('Generate Colissimo shipping label for this order?')) return;

                                        const btn = document.activeElement as HTMLButtonElement;
                                        btn.disabled = true;
                                        btn.innerHTML = '<svg class="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Generating...';

                                        try {
                                            const res = await fetch(`/api/admin/orders/${order.id}/generate-label`, {
                                                method: 'POST'
                                            });
                                            const data = await res.json();

                                            if (data.success) {
                                                // Download label PDF
                                                const link = document.createElement('a');
                                                link.href = data.labelUrl;
                                                link.download = `label_${order.order_number}.pdf`;
                                                link.click();

                                                // Send tracking email
                                                await fetch(`/api/admin/orders/${order.id}/notify-shipped`, { method: 'POST' });

                                                alert(`Label generated! Tracking: ${data.trackingNumber}\nEmail sent to customer.`);
                                                window.location.reload();
                                            } else {
                                                alert(`Error: ${data.error || 'Failed to generate label'}`);
                                            }
                                        } catch (error) {
                                            alert('Label generation failed. Please try again.');
                                        } finally {
                                            btn.disabled = false;
                                            btn.innerHTML = '<svg class="w-3 h-3 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg> Generate Colissimo Label';
                                        }
                                    }}
                                >
                                    <Truck className="w-3 h-3" /> Generate Colissimo Label
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                                        <CheckCircle className="w-4 h-4" />
                                        <span>Label Generated</span>
                                    </div>
                                    {order.carrier_data?.labelUrl && (
                                        <a
                                            href={order.carrier_data.labelUrl}
                                            download={`label_${order.order_number}.pdf`}
                                            className="w-full py-2 bg-gray-100 dark:bg-zinc-800 border dark:border-zinc-700 rounded-md text-xs font-medium flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                                        >
                                            <Download className="w-3 h-3" /> Download Label
                                        </a>
                                    )}
                                    <a
                                        href={`https://www.laposte.fr/outils/suivre-vos-envois?code=${order.tracking_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-medium flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                    >
                                        <Package className="w-3 h-3" /> Track on La Poste
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
