"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";
import { MapPin, Save, Plus, Trash2 } from "lucide-react";
import { useAddress, Address } from "@/context/AddressContext";

export default function AddressesPage() {
    const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAddress();
    const { t } = useLanguage();
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | string | null>(null);
    const [formData, setFormData] = useState({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "France",
    });

    const handleEdit = (address: Address) => {
        setEditingId(address.id);
        setFormData({
            street: address.street,
            city: address.city,
            state: address.state || "",
            postalCode: address.postalCode,
            country: address.country,
        });
        setIsEditing(true);
    };

    const handleAddNew = () => {
        setEditingId(null);
        setFormData({
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "France",
        });
        setIsEditing(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateAddress(editingId, { ...formData, isDefault: addresses.find(a => a.id === editingId)?.isDefault });
                toast.success(t('common.saved') || "Adresse mise à jour");
            } else {
                await addAddress({ ...formData, isDefault: addresses.length === 0 });
                toast.success(t('common.saved') || "Adresse ajoutée");
            }
            setIsEditing(false);
        } catch (err) {
            toast.error("Une erreur est survenue");
        }
    };

    if (loading && addresses.length === 0) {
        return <div className="flex items-center justify-center py-12"><div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="max-w-4xl">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-serif text-black mb-2 flex items-center gap-3">
                        <MapPin className="text-[var(--coffee-brown)]" />
                        {t('account.myAddress') || "Mes Adresses de Livraison"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {t('account.addressDesc') || "Gérez vos adresses de livraison."}
                    </p>
                </div>
                {!isEditing && (
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={14} />
                        {t('common.add') || "Ajouter"}
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.street') || "RUE"}</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-200 py-3 text-black focus:border-black outline-none transition-colors"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.city') || "VILLE"}</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-200 py-3 text-black focus:border-black outline-none transition-colors"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.postalCode') || "CODE POSTAL"}</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-200 py-3 text-black focus:border-black outline-none transition-colors"
                                    value={formData.postalCode}
                                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.state') || "RÉGION"}</label>
                                <input
                                    type="text"
                                    className="w-full border-b border-gray-200 py-3 text-black focus:border-black outline-none transition-colors"
                                    value={formData.state}
                                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{t('account.form.country') || "PAYS"}</label>
                                <select
                                    className="w-full border-b border-gray-200 py-3 bg-transparent text-black outline-none appearance-none"
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    required
                                >
                                    <option value="France">France</option>
                                    <option value="Belgique">Belgique</option>
                                    <option value="Yemen">Yémen</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <button
                                type="submit"
                                className="px-8 py-3 bg-black text-white text-xs font-bold rounded-full flex items-center gap-2"
                            >
                                <Save size={14} /> {t('common.save') || "Enregistrer"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-8 py-3 border border-gray-200 text-gray-500 text-xs font-bold rounded-full"
                            >
                                {t('common.cancel') || "Annuler"}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.length === 0 ? (
                        <div className="md:col-span-2 text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-400">{t('account.noAddresses') || "Aucune adresse enregistrée"}</p>
                        </div>
                    ) : (
                        addresses.map((address) => (
                            <div key={address.id} className={`p-6 rounded-3xl border ${address.isDefault ? 'border-black bg-white' : 'border-gray-100 bg-white'} shadow-sm relative group`}>
                                {address.isDefault && (
                                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest bg-black text-white px-2 py-1 rounded">
                                        Default
                                    </span>
                                )}
                                <div className="space-y-1 pr-12">
                                    <p className="font-medium text-black">{address.street}</p>
                                    <p className="text-sm text-gray-500">{address.postalCode} {address.city}</p>
                                    <p className="text-sm text-gray-500">{address.country}</p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-50 flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleEdit(address)}
                                        className="text-xs font-bold uppercase tracking-widest text-black hover:underline"
                                    >
                                        {t('common.edit') || "Modifier"}
                                    </button>
                                    <button
                                        onClick={() => deleteAddress(address.id)}
                                        className="text-xs font-bold uppercase tracking-widest text-red-500 hover:underline flex items-center gap-1"
                                    >
                                        <Trash2 size={12} /> {t('common.delete') || "Supprimer"}
                                    </button>
                                    {!address.isDefault && (
                                        <button
                                            onClick={() => setDefaultAddress(address.id)}
                                            className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
                                        >
                                            {t('common.setDefault') || "Par défaut"}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
