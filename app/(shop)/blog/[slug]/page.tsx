"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Calendar, ArrowLeft, Share2, Loader2 } from "lucide-react";
import { use, useEffect, useState } from "react";
import { getBlogPostBySlug } from "@/app/actions/blog";

interface BlogPost {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string | null;
    image: string | null;
    category: string | null;
    publishedAt: Date | string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { language } = useLanguage();
    const [article, setArticle] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchArticle() {
            try {
                const data = await getBlogPostBySlug(slug);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setArticle(data as any);
            } catch (e) {
                console.error("Failed to fetch article", e);
            } finally {
                setLoading(false);
            }
        }
        fetchArticle();
    }, [slug]);

    if (loading) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-60 pb-20 text-center flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-[var(--coffee-brown)]" size={40} />
                    <p className="text-gray-500 font-medium">Chargement de l&apos;article...</p>
                </div>
            </main>
        );
    }

    if (!article) {
        return (
            <main className="min-h-screen bg-white">
                <Navbar />
                <div className="pt-32 pb-20 text-center">
                    <h1 className="text-4xl font-serif text-[var(--coffee-brown)]">
                        {language === 'ar' ? 'المقال غير موجود' : language === 'fr' ? 'Article non trouvé' : 'Article not found'}
                    </h1>
                    <Link href="/blog" className="mt-8 inline-block text-[var(--honey-gold)] hover:underline">
                        {language === 'ar' ? 'العودة إلى المدونة' : language === 'fr' ? 'Retour au blog' : 'Back to blog'}
                    </Link>
                </div>
            </main>
        );
    }

    // Resolve translated content
    const translations = typeof article.translations === 'string'
        ? JSON.parse(article.translations)
        : article.translations;

    const displayTitle = language !== 'en' && translations?.[language]?.title
        ? translations[language].title
        : article.title;

    const displayContent = language !== 'en' && translations?.[language]?.content
        ? translations[language].content
        : article.content;

    const displayCategory = article.category || 'General';

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Image */}
            <div className="relative h-[60vh] mt-20">
                {article.image && (
                    <Image
                        src={article.image}
                        alt={displayTitle}
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block bg-[var(--honey-gold)] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                            {displayCategory}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                            {displayTitle}
                        </h1>
                        <div className="flex items-center gap-6 text-white/90 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <time>{new Date(article.publishedAt || Date.now()).toLocaleDateString(
                                    language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : 'en-US',
                                    { year: 'numeric', month: 'long', day: 'numeric' }
                                )}</time>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <article className="py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:text-[var(--coffee-brown)] prose-p:text-gray-700 prose-p:leading-relaxed"
                        dir={language === 'ar' ? 'rtl' : 'ltr'}
                        dangerouslySetInnerHTML={{ __html: displayContent.replace(/\n/g, '<br/>') }}
                    />

                    {/* Share & Back */}
                    <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                            {language === 'ar' ? 'العودة إلى المدونة' : language === 'fr' ? 'Retour au blog' : 'Back to blog'}
                        </Link>
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({
                                        title: displayTitle,
                                        url: window.location.href
                                    });
                                }
                            }}
                            className="flex items-center gap-2 text-gray-600 hover:text-[var(--honey-gold)] transition-colors"
                        >
                            <Share2 className="w-5 h-5" />
                            {language === 'ar' ? 'مشاركة' : language === 'fr' ? 'Partager' : 'Share'}
                        </button>
                    </div>
                </div>
            </article>
        </main>
    );
}

