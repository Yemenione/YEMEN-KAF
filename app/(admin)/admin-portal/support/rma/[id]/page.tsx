"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Package, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface RMA {
    id: number;
    status: string;
    reason: string;
    resolution: string;
    adminNotes: string | null;
    createdAt: string;
    customer: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
    };
    order: {
        id: number;
        orderNumber: string;
        totalAmount: number;
        items: any[];
    };
}

export default function RMADetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [rma, setRMA] = useState<RMA | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        status: '',
        resolution: '',
        adminNotes: ''
    });

    useEffect(() => {
        if (id) fetchRMA();
    }, [id]);

    const fetchRMA = async () => {
        try {
            const res = await fetch(`/api/admin/rma/${id}`);
            const data = await res.json();
            setRMA(data);
            setFormData({
                status: data.status,
                resolution: data.resolution,
                adminNotes: data.adminNotes || ''
            });
        } catch (error) {
            console.error('Failed to fetch RMA:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/rma/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('RMA updated successfully');
                router.refresh();
            } else {
                alert('Failed to update RMA');
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!rma) return <div>RMA not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin-portal/support/rma"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">RMA #{rma.id}</h1>
                    <p className="text-gray-500 text-sm">Created on {new Date(rma.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="ml-auto bg-[var(--coffee-brown)] text-white px-6 py-2 rounded-md hover:bg-[#5a4635] flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Resolution Panel */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Assessment & Action
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Approved">Approved (Accept Return)</option>
                                    <option value="Rejected">Rejected</option>
                                    <option value="Completed">Completed (Refunded)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resolution Type</label>
                                <select
                                    value={formData.resolution}
                                    onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                >
                                    <option value="Refund">Refund to Payment Method</option>
                                    <option value="Store Credit">Store Credit (Voucher)</option>
                                    <option value="Exchange">Exchange Product</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Internal Notes</label>
                            <textarea
                                rows={4}
                                value={formData.adminNotes}
                                onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
                                placeholder="Details about inspection, refund transaction ID, etc."
                                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700 font-mono text-sm"
                            />
                        </div>
                    </div>

                    {/* Order Items Context */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Order Items Context
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">Original Customer Reason: <span className="text-gray-900 font-medium">"{rma.reason}"</span></p>

                        <div className="border rounded-md overflow-hidden">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-zinc-800">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Product</th>
                                        <th className="px-4 py-2 text-right">Price</th>
                                        <th className="px-4 py-2 text-right">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rma.order.items.map((item: any) => (
                                        <tr key={item.id} className="border-t border-gray-100 dark:border-zinc-800">
                                            <td className="px-4 py-2">{item.productTitle || 'Product'}</td>
                                            <td className="px-4 py-2 text-right">{item.price} €</td>
                                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Customer Info
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Name</span>
                                <span className="font-medium">{rma.customer.firstName} {rma.customer.lastName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span>{rma.customer.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Phone</span>
                                <span>{rma.customer.phone || 'N/A'}</span>
                            </div>
                            <div className="pt-2 border-t mt-2">
                                <Link
                                    href={`/admin-portal/customers/${rma.customer.id}`}
                                    className="text-blue-600 hover:underline block text-center"
                                >
                                    View Customer Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
