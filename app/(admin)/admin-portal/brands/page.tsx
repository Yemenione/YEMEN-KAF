"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    isActive: boolean;
    _count?: { products: number };
}

export default function BrandsPage() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        logo: "",
        description: "",
        isActive: true
    });

    const fetchBrands = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/brands');
            if (res.ok) setBrands(await res.json());
        } catch (error) { console.error(error); }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchBrands();
    }, [fetchBrands]);

    const handleEdit = (brand: Brand) => {
        setEditingBrand(brand);
        setFormData({
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo || "",
            description: brand.description || "",
            isActive: brand.isActive
        });
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingBrand(null);
        setFormData({ name: "", slug: "", logo: "", description: "", isActive: true });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : '/api/admin/brands';
        const method = editingBrand ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsModalOpen(false);
                fetchBrands();
            }
        } catch { alert('Failed to save brand'); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            const res = await fetch(`/api/admin/brands/${id}`, { method: 'DELETE' });
            if (res.ok) fetchBrands();
        } catch { alert('Delete failed'); }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-serif text-[var(--coffee-brown)] dark:text-white">Brands & Suppliers</h1>
                    <p className="text-gray-500">Manage manufacturers and brand partnerships.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                    <Plus size={20} />
                    Add Brand
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {brands.map(brand => (
                    <div key={brand.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                        <div className="h-32 bg-gray-50 dark:bg-zinc-800 flex items-center justify-center relative">
                            {brand.logo ? (
                                <div className="relative w-full h-full p-4">
                                    <Image src={brand.logo} alt={brand.name} fill className="object-contain" />
                                </div>
                            ) : (
                                <ImageIcon className="text-gray-300 w-12 h-12" />
                            )}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                <button onClick={() => handleEdit(brand)} className="bg-white text-blue-600 p-1.5 rounded shadow hover:bg-gray-50"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(brand.id)} className="bg-white text-red-600 p-1.5 rounded shadow hover:bg-gray-50"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-lg truncate">{brand.name}</h3>
                            <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
                                <span>{brand._count?.products || 0} Products</span>
                                <span className={`w-2 h-2 rounded-full ${brand.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-zinc-800">
                            <h3 className="text-xl font-semibold">{editingBrand ? 'Edit Brand' : 'New Brand'}</h3>
                            <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    required
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Logo URL</label>
                                <input
                                    className="w-full px-3 py-2 border rounded-lg dark:bg-zinc-800 dark:border-zinc-700"
                                    value={formData.logo}
                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder="https://"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.isActive}
                                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-[var(--coffee-brown)] rounded focus:ring-[var(--honey-gold)]"
                                />
                                <label htmlFor="active" className="text-sm font-medium">Active Status</label>
                            </div>
                            <button type="submit" className="w-full py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:opacity-90 font-medium">
                                Save Brand
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
