'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    Smartphone,
    Save,
    AlertTriangle,
    Image as ImageIcon,
    Bell,
    Settings as SettingsIcon,
    Plus,
    Trash2,
    RefreshCw,
    CheckCircle2,
    Send,
    History,
    CreditCard,
    Palette,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface AppConfig {
    key: string;
    value: string;
}

interface Banner {
    id: number;
    placement: string;
    imageUrl: string;
    action: string;
    target: string;
}

interface Identity {
    splashUrl: string;
    logoUrl: string;
    primaryColor: string;
}

interface StripeConfig {
    publicKey: string;
    secretKey: string;
}

interface MaintenanceMode {
    enabled: boolean;
    message: string;
}

interface VersionConfig {
    minVersion: string;
}

interface ForceUpdate {
    android: VersionConfig;
    ios: VersionConfig;
}

interface ContactInfo {
    whatsapp?: string;
    email?: string;
}


export default function MobileAppAdminPage() {
    const [configs, setConfigs] = useState<Record<string, unknown>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'banners' | 'notifications' | 'identity' | 'payments' | 'settings' | 'contact'>('banners');

    useEffect(() => {
        fetchConfigs();
    }, []);

    const fetchConfigs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/app-config');
            const data = await res.json();
            if (data.success) {
                const configMap: Record<string, unknown> = {};
                data.configs.forEach((c: AppConfig) => {
                    try {
                        configMap[c.key] = JSON.parse(c.value);
                    } catch {
                        configMap[c.key] = c.value;
                    }
                });
                setConfigs(configMap);
            }
        } catch {
            toast.error("Failed to load app configurations");
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async (key: string, value: unknown) => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/app-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Updated ${key} successfully`);
                setConfigs(prev => ({ ...prev, [key]: value }));
            } else {
                toast.error(data.error || "Save failed");
            }
        } catch {
            toast.error("Communication error with server");
        } finally {
            setSaving(false);
        }
    };

    const syncWithWebsite = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/config');
            const websiteConfig = await res.json();

            // Map web config to app config
            const newIdentity = {
                logoUrl: websiteConfig.logo_url || '/images/logo.png',
                primaryColor: websiteConfig.primary_color || '#cfb160',
                splashUrl: websiteConfig.app_splash_url || '/images/splash_bg.png'
            };

            const newContact = {
                whatsapp: websiteConfig.support_phone || '',
                email: websiteConfig.support_email || ''
            };

            const newBanners = [
                { id: 1, placement: 'home', imageUrl: websiteConfig.app_banner_honey_url || '/images/banner_honey.png', action: 'category', target: 'honey' },
                { id: 2, placement: 'home', imageUrl: websiteConfig.app_banner_coffee_url || '/images/banner_coffee.png', action: 'category', target: 'coffee' }
            ];

            // Save all immediately or just update state?
            // Let's update state and toast
            setConfigs(prev => ({
                ...prev,
                app_identity: newIdentity,
                contact_info: newContact,
                app_banners: newBanners
            }));

            toast.success("Synchronisé avec succès depuis les réglages du site !");
        } catch {
            toast.error("Échec de la synchronisation");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <RefreshCw className="w-8 h-8 animate-spin text-[var(--coffee-brown)]" />
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-zinc-800">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-[var(--coffee-brown)]/10 rounded-lg">
                            <Smartphone className="w-5 h-5 text-[var(--coffee-brown)]" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Centre de Contrôle</span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2">Contrôle Global de l&apos;App</h2>
                    <p className="text-gray-500 text-sm mt-1">Gérez tous les aspects de l&apos;expérience de votre application mobile.</p>
                </div>
                <button onClick={fetchConfigs} className="p-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-2xl transition-all">
                    <RefreshCw className="w-5 h-5" />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 dark:bg-zinc-900/50 rounded-2xl w-fit">
                {[
                    { id: 'banners', icon: ImageIcon, label: 'Bannières' },
                    { id: 'identity', icon: Palette, label: 'Identité' },
                    { id: 'payments', icon: CreditCard, label: 'Paiements' },
                    { id: 'notifications', icon: Bell, label: 'Notifications' },
                    { id: 'settings', icon: SettingsIcon, label: 'Système' },
                    { id: 'contact', icon: Smartphone, label: 'Support' }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as 'banners' | 'notifications' | 'identity' | 'payments' | 'settings' | 'contact')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                            ? "bg-white dark:bg-zinc-800 text-[var(--coffee-brown)] shadow-sm shadow-black/5"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-zinc-300"
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden min-h-[400px]">
                {activeTab === 'banners' && (
                    <BannersManager
                        banners={Array.isArray(configs.app_banners) ? (configs.app_banners as Banner[]) : []}
                        onSave={(newBanners) => saveConfig('app_banners', newBanners)}
                        saving={saving}
                    />
                )}
                {activeTab === 'identity' && (
                    <IdentityManager
                        identity={((configs.app_identity && typeof configs.app_identity === 'object') ? configs.app_identity : { splashUrl: '', logoUrl: '', primaryColor: '#C0A080' }) as Identity}
                        onSave={(i: Identity) => saveConfig('app_identity', i)}
                        saving={saving}
                        syncWithWebsite={syncWithWebsite}
                        loading={loading}
                    />
                )}
                {activeTab === 'payments' && (
                    <PaymentsManager
                        stripe={((configs.stripe_config && typeof configs.stripe_config === 'object') ? configs.stripe_config : { publicKey: '', secretKey: '' }) as StripeConfig}
                        onSave={(s: StripeConfig) => saveConfig('stripe_config', s)}
                        saving={saving}
                    />
                )}
                {activeTab === 'notifications' && <NotificationsManager />}
                {activeTab === 'settings' && (
                    <GlobalSettingsManager
                        maintenance={((configs.maintenance_mode && typeof configs.maintenance_mode === 'object') ? configs.maintenance_mode : { enabled: false, message: '' }) as MaintenanceMode}
                        forceUpdate={((configs.force_update && typeof configs.force_update === 'object') ? configs.force_update : { android: { minVersion: '1.0.0' }, ios: { minVersion: '1.0.0' } }) as ForceUpdate}
                        onSaveMaintenance={(m: MaintenanceMode) => saveConfig('maintenance_mode', m)}
                        onSaveUpdate={(u: ForceUpdate) => saveConfig('force_update', u)}
                        saving={saving}
                    />
                )}
                {activeTab === 'contact' && (
                    <ContactInfoManager
                        contact={((configs.contact_info && typeof configs.contact_info === 'object') ? configs.contact_info : {}) as ContactInfo}
                        onSave={(c: ContactInfo) => saveConfig('contact_info', c)}
                        saving={saving}
                    />
                )}
            </div>
        </div>
    );
}

// --- SUB-COMPONENTS ---

function FileUploadButton({ onUpload, label, icon: Icon = Plus, folder = 'app' }: { onUpload: (url: string) => void, label: string, icon?: React.ElementType, folder?: string }) {
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        try {
            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.url) {
                onUpload(data.url);
                toast.success("Image uploaded successfully");
            } else {
                toast.error("Upload failed");
            }
        } catch {
            toast.error("Error uploading image");
        } finally {
            setUploading(false);
        }
    };

    const TypedIcon = Icon as React.ElementType;
    const displayText = (uploading ? "..." : label) as string;
    return (
        <label className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-lg text-[10px] font-bold transition-all cursor-pointer border border-gray-200 dark:border-zinc-700">
            {uploading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <TypedIcon className="w-3 h-3" />}
            {displayText}
            <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
        </label>
    );
}

function BannersManager({ banners, onSave, saving }: { banners: Banner[], onSave: (b: Banner[]) => void, saving: boolean }) {
    const [localBanners, setLocalBanners] = useState(banners);

    const addBanner = () => {
        setLocalBanners([...localBanners, {
            id: Date.now(),
            placement: 'home',
            imageUrl: '',
            action: 'none',
            target: ''
        }]);
    };

    const removeBanner = (id: number) => {
        setLocalBanners(localBanners.filter(b => b.id !== id));
    };

    const updateBanner = (id: number, field: string, value: string) => {
        setLocalBanners(localBanners.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold">Bannières Intelligentes</h3>
                    <p className="text-sm text-gray-500">Gérez les bannières sur les différentes pages de l&apos;application.</p>
                </div>
                <button onClick={addBanner} className="flex items-center gap-2 px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                    <Plus size={18} /> Ajouter Nouveau
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {localBanners.map((banner) => (
                    <div key={banner.id} className="p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800 space-y-4 relative group">
                        <button onClick={() => removeBanner(banner.id)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 p-1">Emplacement</label>
                                <select
                                    value={banner.placement || 'home'}
                                    onChange={(e) => updateBanner(banner.id, 'placement', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-gray-100 dark:ring-zinc-800"
                                >
                                    <option value="home">Accueil (Carousel)</option>
                                    <option value="shop">Page Boutique</option>
                                    <option value="category">Navigation Catégories</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs font-bold text-gray-400">URL de l&apos;image</label>
                                    <FileUploadButton label="Upload" onUpload={(url) => updateBanner(banner.id, 'imageUrl', url)} folder="banners" />
                                </div>
                                <input
                                    type="text"
                                    value={banner.imageUrl || ''}
                                    onChange={(e) => updateBanner(banner.id, 'imageUrl', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 font-mono"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 p-1">Action</label>
                                <select
                                    value={banner.action || 'none'}
                                    onChange={(e) => updateBanner(banner.id, 'action', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-gray-100 dark:ring-zinc-800"
                                >
                                    <option value="none">Aucune</option>
                                    <option value="product">Lien vers Produit</option>
                                    <option value="category">Lien vers Catégorie</option>
                                    <option value="external">Lien Externe</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 p-1">Cible ID / URL</label>
                                <input
                                    type="text"
                                    value={banner.target || ''}
                                    onChange={(e) => updateBanner(banner.id, 'target', e.target.value)}
                                    className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-2.5 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 font-mono"
                                />
                            </div>
                        </div>

                        {banner.imageUrl && (
                            <div className="mt-4 rounded-xl overflow-hidden aspect-[21/9] bg-gray-200 dark:bg-zinc-800 relative group-hover:ring-2 ring-[var(--coffee-brown)] transition-all">
                                <Image
                                    src={banner.imageUrl}
                                    alt={`Banner ${banner.placement}`}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-[10px] text-white rounded-md uppercase font-bold backdrop-blur-sm">
                                    {banner.placement}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-gray-100 dark:border-zinc-800">
                <button onClick={() => onSave(localBanners)} disabled={saving} className="w-full py-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all font-black uppercase tracking-widest">
                    {saving ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                    Enregistrer toutes les bannières
                </button>
            </div>
        </div>
    );
}

function IdentityManager({ identity, onSave, saving, syncWithWebsite, loading }: { identity: Identity, onSave: (i: Identity) => void, saving: boolean, syncWithWebsite: () => void, loading: boolean }) {
    const [local, setLocal] = useState(identity);

    useEffect(() => {
        setLocal(identity);
    }, [identity]);

    return (
        <div className="p-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-4">
                <h3 className="text-2xl font-black">Identité Visuelle</h3>
                <p className="text-gray-500">Personnalisez l&apos;apparence de l&apos;application, y compris l&apos;écran de démarrage (Splash) et les couleurs.</p>
                <div className="flex justify-center">
                    <button
                        onClick={syncWithWebsite}
                        className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 dark:bg-zinc-800 text-white rounded-full text-xs font-bold hover:bg-[var(--honey-gold)] transition-all shadow-lg"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        Synchroniser avec le site
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                    <div className="space-y-4 p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-2 font-bold text-sm">
                            <Palette className="w-4 h-4 text-[var(--honey-gold)]" /> Thème et Logo
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Logo App (Carré)</label>
                                <FileUploadButton label="Upload" onUpload={(url) => setLocal({ ...local, logoUrl: url })} folder="identity" icon={ImageIcon} />
                            </div>
                            <input value={local.logoUrl || ''} onChange={e => setLocal({ ...local, logoUrl: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 font-mono" placeholder="https://..." />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-gray-400">Couleur Primaire de Marque</label>
                            <div className="flex gap-2">
                                <input type="color" value={local.primaryColor || '#C0A080'} onChange={e => setLocal({ ...local, primaryColor: e.target.value })} className="h-11 w-11 rounded-lg border-none" />
                                <input value={local.primaryColor || '#C0A080'} onChange={e => setLocal({ ...local, primaryColor: e.target.value })} className="flex-1 bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 font-mono" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 p-6 bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800">
                        <div className="flex items-center gap-3 mb-2 font-bold text-sm">
                            <ImageIcon className="w-4 h-4 text-blue-500" /> Écran Splash
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] uppercase font-bold text-gray-400">Image de fond du Splash</label>
                                <FileUploadButton label="Upload" onUpload={(url) => setLocal({ ...local, splashUrl: url })} folder="splash" icon={ImageIcon} />
                            </div>
                            <input value={local.splashUrl || ''} onChange={e => setLocal({ ...local, splashUrl: e.target.value })} className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 font-mono" placeholder="https://..." />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-center p-8 bg-zinc-900 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                    <div className="text-[10px] text-zinc-500 absolute top-4 uppercase font-bold tracking-widest">Aperçu en direct</div>
                    <div className="w-48 h-96 bg-black rounded-[2rem] ring-4 ring-zinc-800 relative overflow-hidden flex items-center justify-center">
                        {local.splashUrl ? (
                            <Image
                                src={local.splashUrl}
                                alt="Splash Background"
                                fill
                                className="object-cover opacity-60"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black" />
                        )}
                        <div className="relative z-10 flex flex-col items-center gap-4">
                            {local.logoUrl ? (
                                <Image
                                    src={local.logoUrl}
                                    alt="Logo Preview"
                                    width={64}
                                    height={64}
                                    className="rounded-2xl shadow-xl"
                                />
                            ) : (
                                <div className="w-16 h-16 bg-zinc-700 rounded-2xl" />
                            )}
                            <div className="h-1 w-24 rounded-full overflow-hidden bg-white/20">
                                <div className="h-full w-2/3 bg-white animate-pulse" style={{ backgroundColor: local.primaryColor }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={() => onSave(local)} disabled={saving} className="w-full py-4 bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all font-black uppercase tracking-widest">
                {saving ? <RefreshCw className="animate-spin" /> : <Save size={20} />}
                Mettre à jour l&apos;identité
            </button>
        </div>
    );
}

function PaymentsManager({ stripe, onSave, saving }: { stripe: StripeConfig, onSave: (s: StripeConfig) => void, saving: boolean }) {
    const [local, setLocal] = useState(stripe);
    const [showKeys, setShowKeys] = useState(false);

    return (
        <div className="p-8 space-y-12">
            <div className="text-center max-w-xl mx-auto space-y-2">
                <h3 className="text-2xl font-black">Intégration des Paiements</h3>
                <p className="text-gray-500">Configurez les clés Stripe pour les paiements directs et web. Elles seront automatiquement synchronisées avec l&apos;application.</p>
            </div>

            <div className="max-w-2xl mx-auto p-8 bg-gray-50 dark:bg-zinc-800/50 rounded-[2.5rem] border border-gray-100 dark:border-zinc-800 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 font-bold">
                        <CreditCard className="w-6 h-6 text-blue-600" /> Configuration Stripe
                    </div>
                    <button onClick={() => setShowKeys(!showKeys)} className="text-[10px] uppercase font-black text-blue-600 hover:underline flex items-center gap-1">
                        {showKeys ? <Eye className="w-3 h-3" /> : <Eye className="w-3 h-3" />} {showKeys ? 'Masquer' : 'Afficher'} les clés
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Clé Publique (Publishable Key)</label>
                        <input
                            type={showKeys ? 'text' : 'password'}
                            value={local.publicKey || ''}
                            onChange={e => setLocal({ ...local, publicKey: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 font-mono"
                            placeholder="pk_live_..."
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Clé Secrète (Secret Key)</label>
                        <input
                            type={showKeys ? 'text' : 'password'}
                            value={local.secretKey || ''}
                            onChange={e => setLocal({ ...local, secretKey: e.target.value })}
                            className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 font-mono"
                            placeholder="sk_live_..."
                        />
                        <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1">
                            <AlertTriangle size={12} /> Ces clés sont cryptées et ne sont accessibles que par le serveur.
                        </p>
                    </div>
                </div>

                <button onClick={() => onSave(local)} disabled={saving} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all font-black uppercase tracking-widest shadow-xl shadow-blue-600/20">
                    {saving ? <RefreshCw className="animate-spin" /> : <CheckCircle2 size={20} />}
                    Synchroniser les clés Stripe
                </button>
            </div>
        </div>
    );
}

interface NotificationHistoryItem {
    id: string | number;
    title: string;
    body: string;
    createdAt: string;
}

// ... Notifications, GlobalSettings, ContactInfo same as before ...
function NotificationsManager() {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [target, setTarget] = useState('');
    const [sending, setSending] = useState(false);
    const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        fetchHistory();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const res = await fetch('/api/admin/notifications');
            const data = await res.json();
            if (data.success) setHistory(data.notifications);
        } catch {
            // Error logged if needed
        } finally {
            setLoadingHistory(false);
        }
    };

    const sendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !body) return toast.error("Titre et corps requis");

        setSending(true);
        try {
            const res = await fetch('/api/admin/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, body, imageUrl, target })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Diffusion réussie !");
                setTitle(''); setBody(''); setImageUrl(''); setTarget('');
                fetchHistory();
            } else {
                toast.error(data.error);
            }
        } catch {
            toast.error("Échec de l'envoi de la notification");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="flex items-center gap-3"><Send className="text-blue-600" /><h3 className="text-xl font-bold">Nouvelle Notification</h3></div>
                <form onSubmit={sendNotification} className="space-y-4 bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-3xl border border-gray-100 dark:border-zinc-800">
                    <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm ring-1 ring-gray-100 dark:ring-zinc-800" placeholder="Titre..." />
                    <textarea value={body} onChange={(e) => setBody(e.target.value)} className="w-full bg-white dark:bg-zinc-900 border-none rounded-xl px-4 py-3 text-sm ring-1 ring-gray-100 dark:ring-zinc-800 h-24" placeholder="Corps..." />
                    <button type="submit" disabled={sending} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                        {sending ? <RefreshCw className="animate-spin" /> : <Send size={18} />} Envoyer maintenant
                    </button>
                </form>
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-3"><History className="text-zinc-600" /><h3 className="text-xl font-bold">Historique</h3></div>
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-3xl border border-gray-100 dark:border-zinc-800 divide-y max-h-[400px] overflow-y-auto">
                    {history.map(item => (
                        <div key={item.id} className="p-4"><p className="text-sm font-bold truncate">{item.title}</p><p className="text-xs text-zinc-500 truncate text-gray-500">{item.body}</p></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function GlobalSettingsManager({ maintenance, forceUpdate, onSaveMaintenance, onSaveUpdate, saving }: { maintenance: MaintenanceMode, forceUpdate: ForceUpdate, onSaveMaintenance: (m: MaintenanceMode) => void, onSaveUpdate: (u: ForceUpdate) => void, saving: boolean }) {
    const [localMaintenance, setLocalMaintenance] = useState(maintenance);
    const [localUpdate, setLocalUpdate] = useState(forceUpdate);

    return (
        <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
                <div className="flex items-center gap-3"><AlertTriangle className="text-amber-600" /><h3 className="text-xl font-bold">Mode Maintenance</h3></div>
                <div className="p-6 bg-amber-50/50 rounded-3xl space-y-4">
                    <button onClick={() => setLocalMaintenance({ ...localMaintenance, enabled: !localMaintenance.enabled })} className={`w-14 h-8 rounded-full relative ${localMaintenance.enabled ? 'bg-amber-500' : 'bg-gray-300'}`}><div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${localMaintenance.enabled ? 'left-7' : 'left-1'}`} /></button>
                    <textarea value={localMaintenance.message || ''} onChange={(e) => setLocalMaintenance({ ...localMaintenance, message: e.target.value })} className="w-full rounded-xl p-3 text-sm ring-1 ring-gray-100 bg-white" placeholder="Message de maintenance..." />
                    <button onClick={() => onSaveMaintenance(localMaintenance)} disabled={saving} className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold uppercase text-[10px]">Sauvegarder la maintenance</button>
                </div>
            </div>
            <div className="space-y-6">
                <div className="flex items-center gap-3"><RefreshCw className="text-blue-600" /><h3 className="text-xl font-bold">Contrôle de Version</h3></div>
                <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-zinc-800 rounded-2xl flex gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold">Android</label>
                            <input value={localUpdate.android.minVersion} onChange={e => setLocalUpdate({ ...localUpdate, android: { ...localUpdate.android, minVersion: e.target.value } })} className="w-full p-2 rounded-lg text-xs font-mono bg-white dark:bg-zinc-900" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-bold">iOS</label>
                            <input value={localUpdate.ios.minVersion} onChange={e => setLocalUpdate({ ...localUpdate, ios: { ...localUpdate.ios, minVersion: e.target.value } })} className="w-full p-2 rounded-lg text-xs font-mono bg-white dark:bg-zinc-900" />
                        </div>
                    </div>
                    <button onClick={() => onSaveUpdate(localUpdate)} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs">Mettre à jour les versions</button>
                </div>
            </div>
        </div>
    );
}

function ContactInfoManager({ contact, onSave, saving }: { contact: ContactInfo, onSave: (c: ContactInfo) => void, saving: boolean }) {
    const [local, setLocal] = useState(contact);
    return (
        <div className="p-12 max-w-xl mx-auto space-y-6">
            <div className="w-full p-8 bg-gray-50 dark:bg-zinc-800 rounded-[2.5rem] space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 px-1">WhatsApp Support</label>
                    <input value={local.whatsapp || ''} onChange={e => setLocal({ ...local, whatsapp: e.target.value })} className="w-full p-3 rounded-xl ring-1 ring-gray-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 font-mono" placeholder="WhatsApp..." />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 px-1">Email Support</label>
                    <input value={local.email || ''} onChange={e => setLocal({ ...local, email: e.target.value })} className="w-full p-3 rounded-xl ring-1 ring-gray-100 dark:ring-zinc-700 bg-white dark:bg-zinc-900 font-mono" placeholder="Email..." />
                </div>
                <button onClick={() => onSave(local)} className="w-full py-4 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest mt-4">Mettre à jour le support</button>
            </div>
        </div>
    );
}
