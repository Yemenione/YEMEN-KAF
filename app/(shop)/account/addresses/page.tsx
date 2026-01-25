"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { MapPin, Save } from "lucide-react";

interface Address {
    id: number;
    street: string;
    city: string;
    state?: string;
    postal_code?: string;
    country: string;
    is_default: number;
}

export default function AddressesPage() {
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useLanguage();
    const [addressId, setAddressId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "France", // Default to France as it seems to be the target market based on other files
    });

    useEffect(() => {
        fetchAddress();
    }, []);

    const fetchAddress = async () => {
        try {
            const res = await fetch('/api/account/addresses');
            if (res.ok) {
                const data = await res.json();
                if (data.addresses && data.addresses.length > 0) {
                    // Use the default address if available, otherwise the first one
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const defaultAddress = data.addresses.find((a: any) => a.is_default) || data.addresses[0];
                    setAddressId(defaultAddress.id);
                    setFormData({
                        street: defaultAddress.street_address || defaultAddress.street || "",
                        city: defaultAddress.city || "",
                        state: defaultAddress.state || "",
                        postalCode: defaultAddress.postal_code || defaultAddress.postalCode || "",
                        country: defaultAddress.country || "France"
                    });
                }
            }
        } catch (err) {
            console.error('Failed to fetch addresses', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const url = addressId ? `/api/account/addresses/${addressId}` : '/api/account/addresses';
            const method = addressId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, isDefault: true }), // Always default
            });

            if (res.ok) {
                toast.success(t('common.saved') || "Adresse enregistrée avec succès");
                // Refresh to ensure we have the ID if we just created it (though we'd need to re-fetch or use response)
                fetchAddress();
            } else {
                toast.error("Erreur lors de l'enregistrement de l'adresse");
            }
        } catch (err) {
            console.error('Failed to save address', err);
            toast.error("Erreur technique");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !formData.street) {
        return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-serif text-black mb-2 flex items-center gap-3">
                    <MapPin className="text-[var(--coffee-brown)]" />
                    {t('account.myAddress') || "Mon Adresse de Livraison"}
                </h1>
                <p className="text-gray-500 text-sm">
                    {t('account.addressDesc') || "Gérez votre adresse de livraison principale. Elle sera utilisée par défaut lors de vos commandes."}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.country') || "PAYS"}</label>
                        <select
                            className="w-full border-b border-gray-200 py-3 bg-transparent text-black focus:border-black outline-none transition-colors appearance-none"
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            required
                        >
                            <option value="France">France</option>
                            <option value="Belgique">Belgique</option>
                            <option value="Suisse">Suisse</option>
                            <option value="Yemen">Yémen</option>
                            <option value="Other">Autre</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.street') || "RUE"}</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-3 text-black placeholder-gray-300 focus:border-black outline-none transition-colors"
                                value={formData.street}
                                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                placeholder="123 Rue de Exemple"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.postalCode') || "CODE POSTAL"}</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-3 text-black placeholder-gray-300 focus:border-black outline-none transition-colors"
                                value={formData.postalCode}
                                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                placeholder="75000"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.city') || "VILLE"}</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-3 text-black placeholder-gray-300 focus:border-black outline-none transition-colors"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Paris"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.state') || "RÉGION / ÉTAT"}</label>
                            <input
                                type="text"
                                className="w-full border-b border-gray-200 py-3 text-black placeholder-gray-300 focus:border-black outline-none transition-colors"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="Île-de-France (Optionnel)"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto px-10 py-4 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-full hover:bg-[#333] transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
                    >
                        {isLoading ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Save size={16} />
                                {t('common.save') || "ENREGISTRER L'ADRESSE"}
                            </>
                        )}
                    </button>
                    <p className="text-center md:text-left mt-4 text-[10px] text-gray-400 uppercase tracking-wider">
                        {t('account.addressSecurePromise') || "Vos informations sont sécurisées et ne seront utilisées que pour la livraison."}
                    </p>
                </div>
            </form>
        </div>
    );
}
