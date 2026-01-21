"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Upload, Loader2, Image as ImageIcon, Globe, EyeOff, X, Settings } from "lucide-react";
import Link from "next/link";
import { createBlogPost, updateBlogPost } from "@/app/actions/blog";
import { toast } from "sonner";
import Image from "next/image";

interface BlogFormProps {
    post?: {
        id: number;
        title: string;
        slug: string;
        content: string;
        excerpt: string;
        image: string;
        category: string;
        status: string;
    }
}

export default function BlogForm({ post }: BlogFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: post?.title || "",
        slug: post?.slug || "",
        content: post?.content || "",
        excerpt: post?.excerpt || "",
        image: post?.image || "",
        category: post?.category || "General",
        status: post?.status || "DRAFT",
    });


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        toast.info("Le téléchargement d&apos;images est temporairement désactivé (migration en cours).");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.slug) {
            toast.error("Titre et Slug requis");
            return;
        }

        setLoading(true);
        const res = post
            ? await updateBlogPost(post.id, { ...formData, status: formData.status as "DRAFT" | "PUBLISHED" })
            : await createBlogPost({ ...formData, status: formData.status as "DRAFT" | "PUBLISHED" });

        if (res.success) {
            toast.success(post ? "Article mis à jour" : "Article créé");
            router.push("/admin-portal/cms/blog");
            router.refresh();
        } else {
            toast.error("Une erreur est survenue");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm sticky top-4 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/admin-portal/cms/blog" className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold">{post ? "Modifier l&apos;article" : "Nouvel Article"}</h1>
                        <p className="text-xs text-gray-500">Rédigez du contenu de qualité pour vos clients.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-[var(--coffee-brown)] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#5a4635] transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Enregistrer
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-2">Titre de l&apos;article</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => {
                                    const title = e.target.value;
                                    setFormData({
                                        ...formData,
                                        title,
                                        slug: !post ? title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') : formData.slug
                                    });
                                }}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border border-transparent focus:border-[var(--honey-gold)] rounded-lg px-4 py-3 outline-none transition-all text-lg font-serif"
                                placeholder="Ex: Les bienfaits du miel de Sidr..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Slug (URL)</label>
                            <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-lg px-4 py-2 border border-transparent">
                                <span className="text-gray-400 text-sm">/blog/</span>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="bg-transparent outline-none w-full text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold mb-2">Contenu</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border border-transparent focus:border-[var(--honey-gold)] rounded-lg px-4 py-3 outline-none transition-all min-h-[400px] font-sans leading-relaxed"
                                placeholder="Écrivez votre article ici... (Supporte le HTML)"
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Settings */}
                <div className="space-y-6">
                    {/* Status & Category */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <Settings size={18} className="text-[var(--honey-gold)]" />
                            Paramètres
                        </h3>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Statut</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: "DRAFT" })}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${formData.status === "DRAFT"
                                        ? "bg-gray-100 border-gray-200 text-gray-900"
                                        : "bg-transparent border-gray-100 text-gray-400"
                                        }`}
                                >
                                    <EyeOff size={14} /> Brouillon
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, status: "PUBLISHED" })}
                                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all border ${formData.status === "PUBLISHED"
                                        ? "bg-green-50 border-green-200 text-green-700"
                                        : "bg-transparent border-gray-100 text-gray-400"
                                        }`}
                                >
                                    <Globe size={14} /> Publié
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Catégorie</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-zinc-800 border-none rounded-lg px-3 py-2 text-sm outline-none"
                            >
                                <option value="General">Général</option>
                                <option value="Sante">Santé & Bien-être</option>
                                <option value="Tradition">Tradition & Culture</option>
                                <option value="Produit">Guides Produits</option>
                            </select>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <h3 className="font-bold flex items-center gap-2">
                            <ImageIcon size={18} className="text-[var(--honey-gold)]" />
                            Image à la une
                        </h3>

                        <div className="relative aspect-video bg-gray-50 dark:bg-zinc-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-200 dark:border-zinc-700 flex flex-col items-center justify-center group">
                            {formData.image ? (
                                <>
                                    <Image src={formData.image} alt="Featured" fill className="object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <label className="cursor-pointer bg-white text-black p-2 rounded-full hover:scale-110 transition-transform">
                                            <Upload size={18} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, image: "" })}
                                            className="bg-white text-red-600 p-2 rounded-full hover:scale-110 transition-transform"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-[var(--honey-gold)] transition-colors">
                                    <Upload size={32} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Télécharger</span>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                </label>
                            )}
                            {/* Upload overlay removed as part of Firebase removal */}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
                        <label className="block text-sm font-bold">Extrait / Résumé</label>
                        <textarea
                            value={formData.excerpt}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-zinc-800 border border-transparent focus:border-[var(--honey-gold)] rounded-lg px-4 py-3 outline-none transition-all text-xs h-24 resize-none"
                            placeholder="Un court résumé pour les cartes d'articles..."
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}
