"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Calendar, ArrowRight, Clock, LayoutGrid } from "lucide-react";
import { getPublishedBlogPosts } from "@/app/actions/blog";
import { useEffect, useState } from "react";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    image: string | null;
    category: string | null;
    publishedAt: Date | string | null;
}

export default function BlogPage() {
    const { language } = useLanguage();
    const [articles, setArticles] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const data = await getPublishedBlogPosts();
                setArticles(data);
            } catch (e) {
                console.error("Failed to fetch posts", e);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    const titles = {
        ar: {
            title: "المدونة",
            subtitle: "مقالات ونصائح حول المنتجات اليمنية التقليدية",
            readMore: "اقرأ المزيد",
            loading: "جاري التحميل...",
            noPosts: "لا توجد مقالات منشورة بعد."
        },
        fr: {
            title: "Blog",
            subtitle: "Articles et conseils sur les produits traditionnels yéménites",
            readMore: "Lire Plus",
            loading: "Chargement...",
            noPosts: "Aucun article publié pour le moment."
        },
        en: {
            title: "Blog",
            subtitle: "Articles and tips about traditional Yemeni products",
            readMore: "Read More",
            loading: "Loading...",
            noPosts: "No articles published yet."
        }
    };

    const text = titles[language as keyof typeof titles] || titles.en;

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl md:text-6xl font-serif text-[var(--coffee-brown)] mb-4">
                        {text.title}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        {text.subtitle}
                    </p>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 animate-pulse">{text.loading}</div>
                    ) : articles.length === 0 ? (
                        <div className="text-center py-20 text-gray-500 italic">{text.noPosts}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {articles.map((article) => (
                                <Link
                                    key={article.id}
                                    href={`/blog/${article.slug}`}
                                    className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-[var(--honey-gold)] transition-all duration-500 hover:shadow-2xl flex flex-col h-full"
                                >
                                    <div className="relative aspect-video overflow-hidden bg-gray-100">
                                        {article.image ? (
                                            <Image
                                                src={article.image}
                                                alt={article.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                                <LayoutGrid size={48} />
                                            </div>
                                        )}
                                        {article.category && (
                                            <div className="absolute top-4 start-4 bg-[var(--honey-gold)] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                                                {article.category}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-6 space-y-4 flex flex-col flex-grow">
                                        <div className="flex items-center gap-4 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                <time>{new Date(article.publishedAt as string || Date.now()).toLocaleDateString(
                                                    language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
                                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                                )}</time>
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-serif text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors line-clamp-2">
                                            {article.title}
                                        </h2>
                                        <p className="text-gray-600 line-clamp-3 leading-relaxed flex-grow">
                                            {article.excerpt}
                                        </p>
                                        <div className="flex items-center gap-2 text-[var(--honey-gold)] font-bold text-sm uppercase tracking-wider pt-4 mt-auto">
                                            {text.readMore}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
