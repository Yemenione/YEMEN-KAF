
"use client";

import { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, ShieldAlert, Mail, Clock, Loader2, Save } from 'lucide-react';
import { format } from 'date-fns';

interface AdminUser {
    id: number;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'EDITOR' | 'SUPPORT' | 'FULFILLMENT';
    avatar: string | null;
    lastLogin: string | null;
}

export default function AdminsPage() {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<number | null>(null);

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/admins');
            const data = await res.json();
            setAdmins(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateRole = async (id: number, role: string) => {
        setSavingId(id);
        try {
            const res = await fetch('/api/admin/admins', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, role })
            });
            if (res.ok) {
                setAdmins(admins.map(a => a.id === id ? { ...a, role: role as any } : a));
            }
        } catch (error) {
            console.error('Role update failed:', error);
        } finally {
            setSavingId(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return { icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20', label: 'Super Admin' };
            case 'EDITOR': return { icon: Shield, color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20', label: 'Editor' };
            case 'SUPPORT': return { icon: ShieldAlert, color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20', label: 'Support' };
            case 'FULFILLMENT': return { icon: Shield, color: 'text-green-600 bg-green-50 dark:bg-green-900/20', label: 'Fulfillment' };
            default: return { icon: Shield, color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20', label: 'Unknown' };
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                    <Users className="w-8 h-8 text-[var(--coffee-brown)]" />
                    Team & Access Control
                </h1>
                <p className="text-gray-500 text-sm">Manage administrative users and their permission levels.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => {
                    const RoleIcon = getRoleBadge(admin.role).icon;
                    return (
                        <div key={admin.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 hover:border-[var(--coffee-brown)] transition-colors group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-[var(--coffee-brown)] overflow-hidden">
                                        {admin.avatar ? <img src={admin.avatar} alt={admin.name} /> : admin.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{admin.name}</h3>
                                        <p className="text-xs text-gray-400 flex items-center gap-1">
                                            <Mail className="w-3 h-3" /> {admin.email}
                                        </p>
                                    </div>
                                </div>
                                <div className={`p-2 rounded-lg ${getRoleBadge(admin.role).color}`}>
                                    <RoleIcon className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-zinc-800">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Last Login</span>
                                    <span className="font-medium">{admin.lastLogin ? format(new Date(admin.lastLogin), 'MMM d, p') : 'Never'}</span>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Access Role</label>
                                    <select
                                        className="w-full p-2 bg-gray-50 dark:bg-zinc-800 border-none rounded-md text-xs font-medium focus:ring-1 focus:ring-[var(--coffee-brown)]"
                                        value={admin.role}
                                        disabled={savingId === admin.id}
                                        onChange={(e) => updateRole(admin.id, e.target.value)}
                                    >
                                        <option value="SUPER_ADMIN">Super Admin</option>
                                        <option value="EDITOR">Editor</option>
                                        <option value="SUPPORT">Support</option>
                                        <option value="FULFILLMENT">Fulfillment</option>
                                    </select>
                                </div>
                            </div>

                            {savingId === admin.id && (
                                <div className="flex justify-center pt-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[var(--coffee-brown)]" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-white space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-[var(--honey-gold)]">
                    <ShieldCheck className="w-5 h-5" />
                    Security Best Practices
                </h4>
                <p className="text-sm text-zinc-400">
                    Always use the minimum required role for each team member. **Super Admins** can manage everything including settings and team members, while **Editors** can only manage catalog content.
                </p>
            </div>
        </div>
    );
}
