
"use client";

import { useState, useEffect } from 'react';
import { Users, Shield, ShieldCheck, ShieldAlert, Mail, Clock, Loader2, Plus, Edit2, Trash2, X, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface AdminUser {
    id: number;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'EDITOR' | 'SUPPORT' | 'FULFILLMENT';
    avatar: string | null;
    lastLogin: string | null;
}

export default function AdminsPage() {
    const { t } = useLanguage();
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EDITOR' as AdminUser['role']
    });

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
            toast.error(t('admin.common.operationFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (admin?: AdminUser) => {
        if (admin) {
            setEditingAdmin(admin);
            setFormData({
                name: admin.name,
                email: admin.email,
                password: '',
                role: admin.role
            });
        } else {
            setEditingAdmin(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'EDITOR'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const url = editingAdmin
                ? `/api/admin/admins/${editingAdmin.id}`
                : '/api/admin/admins';

            const method = editingAdmin ? 'PUT' : 'POST';

            const payload = { ...formData };
            if (editingAdmin && !payload.password) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                delete (payload as any).password;
            }

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                toast.success(editingAdmin ? t('admin.settings.admins.updated') : t('admin.settings.admins.created'));
                setIsModalOpen(false);
                fetchAdmins();
            } else {
                const error = await res.json();
                toast.error(error.error || t('admin.common.operationFailed'));
            }
        } catch {
            toast.error(t('admin.common.operationFailed'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('admin.settings.admins.confirmDelete'))) return;

        try {
            const res = await fetch(`/api/admin/admins/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                toast.success(t('admin.settings.admins.deleted'));
                setAdmins(admins.filter(a => a.id !== id));
            } else {
                const error = await res.json();
                toast.error(error.error || t('admin.common.operationFailed'));
            }
        } catch {
            toast.error('Failed to delete admin');
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

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'SUPER_ADMIN': return t('admin.settings.admins.roles.superAdmin');
            case 'EDITOR': return t('admin.settings.admins.roles.editor');
            case 'SUPPORT': return t('admin.settings.admins.roles.support');
            case 'FULFILLMENT': return t('admin.settings.admins.roles.fulfillment');
            default: return t('admin.common.filter');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="w-8 h-8 text-[var(--coffee-brown)]" />
                        {t('admin.settings.admins.title')}
                    </h1>
                    <p className="text-gray-500 text-sm">{t('admin.settings.admins.subtitle')}</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-[var(--coffee-brown)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity text-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> {t('admin.settings.admins.add')}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {admins.map((admin) => {
                    const roleInfo = getRoleBadge(admin.role);
                    const RoleIcon = roleInfo.icon;
                    return (
                        <div key={admin.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm p-6 space-y-4 hover:border-[var(--coffee-brown)] transition-colors group relative">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(admin)}
                                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md text-gray-500"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(admin.id)}
                                    className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-red-500"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-lg font-bold text-[var(--coffee-brown)] overflow-hidden">
                                        {admin.avatar ? <Image src={admin.avatar} alt={admin.name} width={48} height={48} className="object-cover w-full h-full" /> : admin.name[0]}
                                    </div>
                                    <div className="pr-12">
                                        <h3 className="font-bold line-clamp-1">{admin.name}</h3>
                                        <p className="text-xs text-gray-400 flex items-center gap-1 group-hover:text-gray-600 transition-colors">
                                            <Mail className="w-3 h-3" /> {admin.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-zinc-800">
                                <div className="flex items-center justify-between">
                                    <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${roleInfo.color}`}>
                                        <RoleIcon className="w-3 h-3" />
                                        {getRoleLabel(admin.role)}
                                    </div>
                                    <div className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                                        <Clock className="w-3 h-3" />
                                        {admin.lastLogin ? format(new Date(admin.lastLogin), 'MMM d, p') : t('admin.settings.admins.never')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-xl font-bold">{editingAdmin ? t('admin.settings.admins.edit') : t('admin.settings.admins.addNew')}</h2>
                            <p className="text-sm text-gray-500">
                                {editingAdmin ? t('admin.settings.admins.editDesc') : t('admin.settings.admins.addDesc')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">{t('admin.settings.admins.fullName')}</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">{t('admin.settings.admins.email')}</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">
                                    {editingAdmin ? t('admin.settings.admins.passwordNew') : t('admin.settings.admins.password')}
                                </label>
                                <div className="relative">
                                    <input
                                        required={!editingAdmin}
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none transition-all pr-12"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">{t('admin.settings.admins.role')}</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUser['role'] })}
                                    className="w-full p-2.5 bg-gray-50 dark:bg-zinc-800 border-none rounded-lg focus:ring-1 focus:ring-[var(--coffee-brown)] outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="SUPER_ADMIN">{t('admin.settings.admins.roles.superAdminDesc')}</option>
                                    <option value="EDITOR">{t('admin.settings.admins.roles.editorDesc')}</option>
                                    <option value="SUPPORT">{t('admin.settings.admins.roles.supportDesc')}</option>
                                    <option value="FULFILLMENT">{t('admin.settings.admins.roles.fulfillmentDesc')}</option>
                                </select>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-lg border border-gray-100 dark:border-zinc-800 font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    {t('admin.settings.shipping.cancel')}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 bg-[var(--coffee-brown)] text-white px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {editingAdmin ? t('admin.settings.admins.saveChanges') : t('admin.settings.admins.create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl text-white space-y-2">
                <h4 className="font-bold flex items-center gap-2 text-[var(--honey-gold)]">
                    <ShieldCheck className="w-5 h-5" />
                    {t('admin.settings.admins.securityTips')}
                </h4>
                <p className="text-sm text-zinc-400">
                    {t('admin.settings.admins.securityTipsDesc')}
                </p>
            </div>
        </div>
    );
}
