"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Upload, Loader2, Truck } from "lucide-react";
import Image from "next/image";
import { getFirebaseConfig } from "@/app/actions/settings";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAllCarriers, createCarrier, updateCarrier, deleteCarrier } from "@/app/actions/carriers";
import { toast } from "sonner";

export default function ShippingSettingsPage() {
    const [carriers, setCarriers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingCarrier, setEditingCarrier] = useState<any>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [firebaseConfig, setFirebaseConfig] = useState<any>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        const [carriersData, config] = await Promise.all([
            getAllCarriers(),
            getFirebaseConfig()
        ]);
        setCarriers(carriersData);
        setFirebaseConfig(config);
        setLoading(false);
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, carrierId?: number) => {
        const file = e.target.files?.[0];
        if (!file || !firebaseConfig) return;

        setIsUploading(true);
        try {
            const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
            const storage = getStorage(app);
            const storageRef = ref(storage, `carriers/${Date.now()}_${file.name}`);

            const snapshot = await uploadBytes(storageRef, file);
            const url = await getDownloadURL(snapshot.ref);

            if (editingCarrier) {
                setEditingCarrier({ ...editingCarrier, logo: url });
            } else if (isAdding) {
                setNewCarrier({ ...newCarrier, logo: url });
            }
            toast.success("Logo uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload logo");
        } finally {
            setIsUploading(false);
        }
    };

    const [newCarrier, setNewCarrier] = useState({
        name: "",
        logo: "",
        deliveryTime: "",
        description: "",
        isFree: false,
        isActive: true
    });

    const handleSaveNew = async () => {
        if (!newCarrier.name) {
            toast.error("Name is required");
            return;
        }
        const res = await createCarrier(newCarrier);
        if (res.success) {
            toast.success("Carrier created");
            setIsAdding(false);
            setNewCarrier({ name: "", logo: "", deliveryTime: "", description: "", isFree: false, isActive: true });
            fetchInitialData();
        } else {
            toast.error("Failed to create carrier");
        }
    };

    const handleUpdate = async () => {
        if (!editingCarrier.name) {
            toast.error("Name is required");
            return;
        }
        const res = await updateCarrier(editingCarrier.id, editingCarrier);
        if (res.success) {
            toast.success("Carrier updated");
            setEditingCarrier(null);
            fetchInitialData();
        } else {
            toast.error("Failed to update carrier");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this carrier?")) return;
        const res = await deleteCarrier(id);
        if (res.success) {
            toast.success("Carrier deleted");
            fetchInitialData();
        } else {
            toast.error("Failed to delete carrier");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-gray-400" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Gestion des Transporteurs</h1>
                    <p className="text-gray-500">Gérez les logos et informations de livraison affichés sur les fiches produits.</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={18} />
                        Ajouter un transporteur
                    </button>
                )}
            </div>

            {/* Add New Carrier Form */}
            {isAdding && (
                <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="font-bold text-lg">Nouveau Transporteur</h2>
                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-black">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du transporteur</label>
                                <input
                                    type="text"
                                    value={newCarrier.name}
                                    onChange={(e) => setNewCarrier({ ...newCarrier, name: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
                                    placeholder="Ex: Colissimo, Chronopost..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Temps de livraison</label>
                                <input
                                    type="text"
                                    value={newCarrier.deliveryTime}
                                    onChange={(e) => setNewCarrier({ ...newCarrier, deliveryTime: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-black outline-none"
                                    placeholder="Ex: 48h-72h"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="relative w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                                    {newCarrier.logo ? (
                                        <Image src={newCarrier.logo} alt="Preview" fill className="object-contain p-2" />
                                    ) : (
                                        <Truck size={24} className="text-gray-300" />
                                    )}
                                    {isUploading && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                            <Loader2 className="animate-spin text-black" size={20} />
                                        </div>
                                    )}
                                </div>
                                <label className="cursor-pointer bg-white border px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                    {isUploading ? "Uploading..." : "Choisir un logo"}
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} disabled={isUploading} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black">Annuler</button>
                        <button onClick={handleSaveNew} className="bg-black text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">Enregistrer</button>
                    </div>
                </div>
            )}

            {/* Carriers List */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Logo</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Nom</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Livraison</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Statut</th>
                            <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {carriers.map((carrier) => (
                            <tr key={carrier.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="relative w-12 h-12 bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                                        {carrier.logo ? (
                                            <Image src={carrier.logo} alt={carrier.name} fill className="object-contain p-1" />
                                        ) : (
                                            <Truck size={20} className="text-gray-300" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {editingCarrier?.id === carrier.id ? (
                                        <input
                                            type="text"
                                            value={editingCarrier.name}
                                            onChange={(e) => setEditingCarrier({ ...editingCarrier, name: e.target.value })}
                                            className="border rounded px-2 py-1 text-sm w-full focus:ring-1 focus:ring-black outline-none"
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">{carrier.name}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {editingCarrier?.id === carrier.id ? (
                                        <input
                                            type="text"
                                            value={editingCarrier.deliveryTime}
                                            onChange={(e) => setEditingCarrier({ ...editingCarrier, deliveryTime: e.target.value })}
                                            className="border rounded px-2 py-1 text-sm w-full focus:ring-1 focus:ring-black outline-none"
                                        />
                                    ) : (
                                        <span className="text-sm text-gray-500">{carrier.deliveryTime || "Non spécifié"}</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => {
                                            const updated = { ...carrier, isActive: !carrier.isActive };
                                            updateCarrier(carrier.id, updated).then(() => fetchInitialData());
                                        }}
                                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${carrier.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                            }`}
                                    >
                                        {carrier.isActive ? "Actif" : "Inactif"}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {editingCarrier?.id === carrier.id ? (
                                            <>
                                                <button onClick={handleUpdate} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                                    <Save size={18} />
                                                </button>
                                                <button onClick={() => setEditingCarrier(null)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
                                                    <X size={18} />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={() => setEditingCarrier(carrier)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(carrier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {carriers.length === 0 && (
                    <div className="py-12 text-center space-y-3">
                        <Truck size={40} className="mx-auto text-gray-200" />
                        <p className="text-gray-400 text-sm">Aucun transporteur configuré.</p>
                    </div>
                )}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Truck size={20} className="text-blue-600" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-900">Astuce Premium</h4>
                    <p className="text-sm text-blue-700 mt-1">
                        Les transporteurs configurés ici apparaîtront dynamiquement sur chaque fiche produit avec leur logo et temps de livraison estimé.
                        Utilisez des logos transparents (PNG) pour un rendu optimal.
                    </p>
                </div>
            </div>
        </div>
    );
}
