"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Loader2, Truck, Globe, Package } from "lucide-react";
import Image from "next/image";
import { getAllCarriers, createCarrier, updateCarrier, deleteCarrier } from "@/app/actions/carriers";
import { getZones, createZone, updateZone, deleteZone, createRate, deleteRate } from "@/app/actions/zones";
import { toast } from "sonner";

interface Carrier {
    id: number;
    name: string;
    logo: string | null;
    deliveryTime: string | null;
    description: string | null;
    isFree: boolean;
    isActive: boolean;
}

interface Rate {
    id: number;
    price: number;
    minWeight: number;
    maxWeight: number;
    carrier: Carrier;
    carrierId: number;
}

interface Zone {
    id: number;
    name: string;
    countries: string; // JSON string
    rates: Rate[];
}

const ALL_COUNTRIES = [
    // Europe
    { code: "FR", name: "France" },
    { code: "MC", name: "Monaco" },
    { code: "AD", name: "Andorra" },
    { code: "GB", name: "United Kingdom" },
    { code: "DE", name: "Germany" },
    { code: "BE", name: "Belgium" },
    { code: "NL", name: "Netherlands" },
    { code: "ES", name: "Spain" },
    { code: "IT", name: "Italy" },
    { code: "CH", name: "Switzerland" },
    { code: "AT", name: "Austria" },
    { code: "PT", name: "Portugal" },
    { code: "SE", name: "Sweden" },
    { code: "NO", name: "Norway" },
    { code: "DK", name: "Denmark" },
    { code: "FI", name: "Finland" },
    { code: "IE", name: "Ireland" },
    { code: "GR", name: "Greece" },
    { code: "PL", name: "Poland" },
    { code: "CZ", name: "Czech Republic" },
    { code: "HU", name: "Hungary" },
    // DOM-TOM
    { code: "GP", name: "Guadeloupe" },
    { code: "MQ", name: "Martinique" },
    { code: "RE", name: "La Réunion" },
    { code: "GF", name: "Guyane" },
    { code: "YT", name: "Mayotte" },
    { code: "NC", name: "Nouvelle-Calédonie" },
    { code: "PF", name: "Polynésie" },
    // North America
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    // Middle East
    { code: "SA", name: "Saudi Arabia" },
    { code: "AE", name: "United Arab Emirates" },
    { code: "KW", name: "Kuwait" },
    { code: "QA", name: "Qatar" },
    { code: "BH", name: "Bahrain" },
    { code: "OM", name: "Oman" },
    { code: "YE", name: "Yemen" },
    { code: "TR", name: "Turkey" },
    { code: "EG", name: "Egypt" },
    { code: "MA", name: "Morocco" },
    { code: "DZ", name: "Algeria" },
    { code: "TN", name: "Tunisia" },
    // Asia/Pacific
    { code: "CN", name: "China" },
    { code: "JP", name: "Japan" },
    { code: "KR", name: "South Korea" },
    { code: "SG", name: "Singapore" },
    { code: "AU", name: "Australia" }
];

export default function ShippingSettingsPage() {
    const [activeTab, setActiveTab] = useState<'carriers' | 'zones'>('carriers');
    const [carriers, setCarriers] = useState<Carrier[]>([]);
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);

    // Carrier State
    const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
    const [isAddingCarrier, setIsAddingCarrier] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [newCarrier, setNewCarrier] = useState({
        name: "",
        slug: "",
        logo: "",
        deliveryTime: "",
        description: "",
        price: 0,
        isFree: false,
        isActive: true
    });

    // Zone State
    const [isAddingZone, setIsAddingZone] = useState(false);
    const [newZoneName, setNewZoneName] = useState("");
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);

    // Rate State
    const [addingRateToZone, setAddingRateToZone] = useState<number | null>(null);
    const [newRate, setNewRate] = useState({
        carrierId: "",
        minWeight: 0,
        maxWeight: 1000,
        price: 0
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    async function fetchInitialData() {
        setLoading(true);
        const [carriersData, zonesData] = await Promise.all([
            getAllCarriers(),
            getZones()
        ]);
        setCarriers(carriersData);
        if (zonesData.success && zonesData.data) {
            setZones(zonesData.data as unknown as Zone[]);
        }
        setLoading(false);
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'carriers');

            const res = await fetch('/api/admin/media/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            const url = data.path;

            if (editingCarrier) {
                setEditingCarrier({ ...editingCarrier, logo: url });
            } else if (isAddingCarrier) {
                setNewCarrier({ ...newCarrier, logo: url });
            }
            toast.success("Logo uploaded");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload logo");
        } finally {
            setIsUploading(false);
        }
    };

    // Carrier Handlers
    const handleSaveNewCarrier = async () => {
        if (!newCarrier.name) return toast.error("Name is required");
        const res = await createCarrier(newCarrier);
        if (res.success) {
            toast.success("Carrier created");
            setIsAddingCarrier(false);
            setNewCarrier({ name: "", slug: "", logo: "", deliveryTime: "", description: "", price: 0, isFree: false, isActive: true });
            fetchInitialData();
        } else {
            toast.error("Failed to create carrier");
        }
    };

    const handleUpdateCarrier = async () => {
        if (!editingCarrier) return;
        const payload = {
            ...editingCarrier,
            logo: editingCarrier.logo || undefined,
            deliveryTime: editingCarrier.deliveryTime || undefined,
            description: editingCarrier.description || undefined
        };
        const res = await updateCarrier(editingCarrier.id, payload);
        if (res.success) {
            toast.success("Carrier updated");
            setEditingCarrier(null);
            fetchInitialData();
        } else {
            toast.error("Failed to update carrier");
        }
    };

    const handleDeleteCarrier = async (id: number) => {
        if (!confirm("Delete this carrier?")) return;
        const res = await deleteCarrier(id);
        if (res.success) {
            toast.success("Carrier deleted");
            fetchInitialData();
        }
    };

    // Zone Handlers
    const handleCreateZone = async () => {
        if (!newZoneName) return toast.error("Zone name required");
        if (selectedCountries.length === 0) return toast.error("Select at least one country");

        const res = await createZone({ name: newZoneName, countries: selectedCountries });
        if (res.success) {
            toast.success("Zone created");
            setIsAddingZone(false);
            setNewZoneName("");
            setSelectedCountries([]);
            fetchInitialData();
        } else {
            toast.error("Failed to create zone");
        }
    };

    const handleDeleteZone = async (id: number) => {
        if (!confirm("Delete this zone and all its rates?")) return;
        const res = await deleteZone(id);
        if (res.success) {
            toast.success("Zone deleted");
            fetchInitialData();
        }
    };

    // Rate Handlers
    const handleaddRate = async (zoneId: number) => {
        if (!newRate.carrierId) return toast.error("Select a carrier");

        const res = await createRate({
            zoneId,
            carrierId: Number(newRate.carrierId),
            minWeight: Number(newRate.minWeight),
            maxWeight: Number(newRate.maxWeight),
            price: Number(newRate.price)
        });

        if (res.success) {
            toast.success("Rate added");
            setAddingRateToZone(null);
            setNewRate({ carrierId: "", minWeight: 0, maxWeight: 1000, price: 0 });
            fetchInitialData();
        } else {
            toast.error("Failed to add rate");
        }
    };

    const handleDeleteRate = async (id: number) => {
        if (!confirm("Delete this rate?")) return;
        const res = await deleteRate(id);
        if (res.success) {
            toast.success("Rate deleted");
            fetchInitialData();
        }
    };

    const toggleCountry = (code: string) => {
        if (selectedCountries.includes(code)) {
            setSelectedCountries(selectedCountries.filter(c => c !== code));
        } else {
            setSelectedCountries([...selectedCountries, code]);
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
        <div className="space-y-8 p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Paramètres de Livraison</h1>
                    <p className="text-gray-500">Gérez les transporteurs, les zones et les tarifs d&apos;expédition.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b">
                <button
                    onClick={() => setActiveTab('carriers')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'carriers' ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                >
                    Transporteurs
                    {activeTab === 'carriers' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                </button>
                <button
                    onClick={() => setActiveTab('zones')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'zones' ? 'text-black' : 'text-gray-500 hover:text-black'}`}
                >
                    Zones & Tarifs
                    {activeTab === 'zones' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-black" />}
                </button>
            </div>

            {/* CARRIERS TAB */}
            {activeTab === 'carriers' && (
                <div className="space-y-6">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAddingCarrier(true)}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                            <Plus size={16} /> Ajouter un transporteur
                        </button>
                    </div>

                    {isAddingCarrier && (
                        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">Nouveau Transporteur</h3>
                                <button onClick={() => setIsAddingCarrier(false)}><X size={18} /></button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom</label>
                                    <input type="text" value={newCarrier.name} onChange={e => setNewCarrier({ ...newCarrier, name: e.target.value })} className="w-full border rounded p-2 text-sm" placeholder="DHL, FedEx..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Délai</label>
                                    <input type="text" value={newCarrier.deliveryTime} onChange={e => setNewCarrier({ ...newCarrier, deliveryTime: e.target.value })} className="w-full border rounded p-2 text-sm" placeholder="24h-48h" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Logo</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 border rounded bg-gray-50 flex items-center justify-center relative">
                                            {newCarrier.logo ? <Image src={newCarrier.logo} alt="Logo" fill className="object-contain p-1" /> : <Truck className="text-gray-300" />}
                                            {isUploading && <div className="absolute inset-0 bg-white/50 flex items-center justify-center"><Loader2 className="animate-spin" /></div>}
                                        </div>
                                        <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-xs font-medium">
                                            Upload <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end action">
                                <button onClick={handleSaveNewCarrier} className="bg-black text-white px-4 py-2 rounded text-sm">Enregistrer</button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4">
                        {carriers.map(carrier => (
                            <div key={carrier.id} className="bg-white border rounded-lg p-4 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 border rounded bg-gray-50 flex items-center justify-center relative">
                                        {carrier.logo ? <Image src={carrier.logo} alt={carrier.name} fill className="object-contain p-1" /> : <Truck className="text-gray-300" />}
                                    </div>
                                    <div>
                                        {editingCarrier?.id === carrier.id ? (
                                            <input value={editingCarrier.name} onChange={e => setEditingCarrier({ ...editingCarrier, name: e.target.value })} className="border rounded px-2 py-1 text-sm font-bold" />
                                        ) : (
                                            <h3 className="font-bold">{carrier.name}</h3>
                                        )}
                                        <p className="text-xs text-gray-500">{carrier.deliveryTime || "Pas de délai"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {editingCarrier?.id === carrier.id ? (
                                        <button onClick={handleUpdateCarrier} className="p-2 text-green-600 bg-green-50 rounded"><Save size={16} /></button>
                                    ) : (
                                        <button onClick={() => setEditingCarrier(carrier)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                                    )}
                                    <button onClick={() => handleDeleteCarrier(carrier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ZONES TAB */}
            {activeTab === 'zones' && (
                <div className="space-y-8">
                    <div className="flex justify-end">
                        <button
                            onClick={() => setIsAddingZone(true)}
                            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
                        >
                            <Plus size={16} /> Ajouter une Zone
                        </button>
                    </div>

                    {isAddingZone && (
                        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">Nouvelle Zone d&apos;Expédition</h3>
                                <button onClick={() => setIsAddingZone(false)}><X size={18} /></button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nom de la Zone</label>
                                <input
                                    type="text"
                                    value={newZoneName}
                                    onChange={e => setNewZoneName(e.target.value)}
                                    className="w-full border rounded p-2 text-sm"
                                    placeholder="Ex: Europe, France Métropolitaine..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Pays inclus</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 border rounded p-4 max-h-48 overflow-y-auto">
                                    {ALL_COUNTRIES.map(country => (
                                        <button
                                            key={country.code}
                                            onClick={() => toggleCountry(country.code)}
                                            className={`text-xs px-2 py-1.5 rounded text-left transition-colors ${selectedCountries.includes(country.code) ? 'bg-black text-white' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'}`}
                                        >
                                            {selectedCountries.includes(country.code) && "✓ "}{country.name}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">{selectedCountries.length} pays sélectionnés</p>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handleCreateZone} className="bg-black text-white px-4 py-2 rounded text-sm">Créer la Zone</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {zones.map(zone => (
                            <div key={zone.id} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-gray-50 p-4 border-b flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Globe size={18} className="text-gray-500" />
                                        <h3 className="font-bold text-lg">{zone.name}</h3>
                                        <span className="bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                                            {(() => {
                                                try {
                                                    const countries = JSON.parse(zone.countries);
                                                    return `${countries.length} pays`;
                                                } catch { return '0 pays'; }
                                            })()}
                                        </span>
                                    </div>
                                    <button onClick={() => handleDeleteZone(zone.id)} className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={16} /></button>
                                </div>

                                <div className="p-4">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h4 className="text-sm font-bold text-gray-700">Tarifs Configurés</h4>
                                        <button onClick={() => setAddingRateToZone(zone.id)} className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded flex items-center gap-1">
                                            <Plus size={12} /> Ajouter un tarif
                                        </button>
                                    </div>

                                    {addingRateToZone === zone.id && (
                                        <div className="bg-gray-50 p-4 rounded-lg mb-4 border border-blue-200">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">Transporteur</label>
                                                    <select
                                                        className="w-full text-sm border rounded p-1.5"
                                                        value={newRate.carrierId}
                                                        onChange={e => setNewRate({ ...newRate, carrierId: e.target.value })}
                                                    >
                                                        <option value="">Choisir...</option>
                                                        {carriers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">Poids Min (g)</label>
                                                    <input type="number" className="w-full text-sm border rounded p-1.5" value={newRate.minWeight} onChange={e => setNewRate({ ...newRate, minWeight: Number(e.target.value) })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">Poids Max (g)</label>
                                                    <input type="number" className="w-full text-sm border rounded p-1.5" value={newRate.maxWeight} onChange={e => setNewRate({ ...newRate, maxWeight: Number(e.target.value) })} />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">Prix (€)</label>
                                                    <input type="number" className="w-full text-sm border rounded p-1.5" value={newRate.price} onChange={e => setNewRate({ ...newRate, price: Number(e.target.value) })} />
                                                </div>
                                            </div>
                                            <div className="mt-3 flex gap-2 justify-end">
                                                <button onClick={() => setAddingRateToZone(null)} className="text-xs text-gray-500 hover:text-black">Annuler</button>
                                                <button onClick={() => handleaddRate(zone.id)} className="bg-black text-white text-xs px-3 py-1.5 rounded">Valider</button>
                                            </div>
                                        </div>
                                    )}

                                    {zone.rates && zone.rates.length > 0 ? (
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-gray-50 text-gray-500">
                                                <tr>
                                                    <th className="p-2 font-medium">Transporteur</th>
                                                    <th className="p-2 font-medium">Poids</th>
                                                    <th className="p-2 font-medium">Prix</th>
                                                    <th className="p-2 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {zone.rates.map(rate => (
                                                    <tr key={rate.id} className="border-b last:border-0 hover:bg-gray-50">
                                                        <td className="p-2 flex items-center gap-2">
                                                            {rate.carrier.logo ? <Image src={rate.carrier.logo} alt="" width={20} height={20} className="object-contain" /> : <Package size={14} />}
                                                            {rate.carrier.name}
                                                        </td>
                                                        <td className="p-2">{rate.minWeight}g - {rate.maxWeight}g</td>
                                                        <td className="p-2 font-bold">{Number(rate.price).toFixed(2)}€</td>
                                                        <td className="p-2 text-right">
                                                            <button onClick={() => handleDeleteRate(rate.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <p className="text-xs text-gray-400 italic">Aucun tarif configuré pour cette zone.</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {zones.length === 0 && (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed">
                                <Globe className="mx-auto text-gray-300 mb-2" size={32} />
                                <p className="text-gray-500 text-sm">Aucune zone. Commencez par créer une zone (ex: Europe).</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
