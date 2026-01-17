"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, Save, ArrowLeft, Mail, Phone, Calendar, Package } from 'lucide-react';
import Link from 'next/link';

interface Customer {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    createdAt: string;
    customerGroupId: number | null;
    orders: any[];
}

interface CustomerGroup {
    id: number;
    name: string;
}

export default function CustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [customer, setCustomer] = useState<Customer | null>(null);
    const [groups, setGroups] = useState<CustomerGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        customerGroupId: ''
    });

    useEffect(() => {
        if (id) {
            Promise.all([
                fetch(`/api/admin/customers/${id}`),
                fetch('/api/admin/customers/groups')
            ]).then(async ([custRes, groupsRes]) => {
                if (custRes.ok && groupsRes.ok) {
                    const custData = await custRes.json();
                    const groupsData = await groupsRes.json();

                    setCustomer(custData);
                    setGroups(groupsData);
                    setFormData({
                        firstName: custData.firstName || '',
                        lastName: custData.lastName || '',
                        phone: custData.phone || '',
                        customerGroupId: custData.customerGroupId?.toString() || ''
                    });
                }
                setLoading(false);
            });
        }
    }, [id]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert('Customer updated successfully');
                router.refresh(); // Refresh server components if any
            } else {
                alert('Failed to update customer');
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!customer) return <div>Customer not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin-portal/customers"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">{customer.firstName} {customer.lastName}</h1>
                    <p className="text-gray-500 text-sm">Customer ID: #{customer.id}</p>
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
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Personal Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name</label>
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={customer.email}
                                    disabled
                                    className="w-full px-3 py-2 border rounded-md bg-gray-50 dark:bg-zinc-800 dark:border-zinc-700 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            CRM Settings
                        </h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer Group</label>
                            <select
                                value={formData.customerGroupId}
                                onChange={(e) => setFormData({ ...formData, customerGroupId: e.target.value })}
                                className="w-full px-3 py-2 border rounded-md dark:bg-zinc-800 dark:border-zinc-700"
                            >
                                <option value="">None (Standard)</option>
                                {groups.map(g => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Assigning a group may apply automatic discounts.</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg border border-gray-100 dark:border-zinc-800 shadow-sm">
                        <h3 className="font-semibold mb-4">Overview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-zinc-800">
                                <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Joined</span>
                                <span className="text-sm font-medium ">{new Date(customer.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-sm text-gray-500 flex items-center gap-2"><Package className="w-4 h-4" /> Orders</span>
                                <span className="text-sm font-medium">{customer.orders.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
