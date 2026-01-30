import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import { Calendar, ArrowRight, ArrowLeft } from "lucide-react";

interface Article {
    title: string;
    excerpt: string;
    image: string;
    date: string;
    slug: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
}

export default function BlogSection({ articles = [] }: { articles?: Article[] }) {
    const { language } = useLanguage();

    const fallbackArticles = {
        ar: [
            {
                title: "فوائد العسل اليمني الصحية",
                excerpt: "اكتشف الفوائد الصحية المذهلة للعسل اليمني الطبيعي وكيف يمكن أن يحسن صحتك اليومية.",
                image: "/images/blog/honey-benefits.jpg",
                date: "15 يناير 2026",
                slug: "honey-health-benefits"
            },
            {
                title: "كيف تختار البخور الأصيل",
                excerpt: "دليل شامل لاختيار البخور اليمني الأصلي والتمييز بين الأنواع المختلفة.",
                image: "/images/blog/incense-guide.jpg",
                date: "10 يناير 2026",
                slug: "authentic-incense-guide"
            },
            {
                title: "تاريخ القهوة اليمنية",
                excerpt: "رحلة عبر تاريخ القهوة اليمنية العريق وكيف أصبحت من أفضل أنواع القهوة في العالم.",
                image: "/images/blog/coffee-history.jpg",
                date: "5 يناير 2026",
                slug: "yemeni-coffee-history"
            }
        ],
        fr: [
            {
                title: "Bienfaits du Miel Yéménite",
                excerpt: "Découvrez les bienfaits extraordinaires du miel yéménite naturel pour votre santé quotidienne.",
                image: "/images/blog/honey-benefits.jpg",
                date: "15 janvier 2026",
                slug: "honey-health-benefits"
            },
            {
                title: "Comment Choisir l'Encens Authentique",
                excerpt: "Guide complet pour choisir l'encens yéménite authentique et distinguer les différentes variétés.",
                image: "/images/blog/incense-guide.jpg",
                date: "10 janvier 2026",
                slug: "authentic-incense-guide"
            },
            {
                title: "Histoire du Café Yéménite",
                excerpt: "Voyage à travers l'histoire riche du café yéménite et comment il est devenu l'un des meilleurs au monde.",
                image: "/images/blog/coffee-history.jpg",
                date: "5 janvier 2026",
                slug: "yemeni-coffee-history"
            }
        ],
        en: [
            {
                title: "Health Benefits of Yemeni Honey",
                excerpt: "Discover the amazing health benefits of natural Yemeni honey and how it can improve your daily wellness.",
                image: "/images/blog/honey-benefits.jpg",
                date: "January 15, 2026",
                slug: "honey-health-benefits"
            },
            {
                title: "How to Choose Authentic Incense",
                excerpt: "Complete guide to choosing authentic Yemeni incense and distinguishing between different varieties.",
                image: "/images/blog/incense-guide.jpg",
                date: "January 10, 2026",
                slug: "authentic-incense-guide"
            },
            {
                title: "History of Yemeni Coffee",
                excerpt: "Journey through the rich history of Yemeni coffee and how it became one of the world's finest.",
                image: "/images/blog/coffee-history.jpg",
                date: "January 5, 2026",
                slug: "yemeni-coffee-history"
            }
        ]
    };

    const displayArticles = articles.length > 0 ? articles.map(a => {
        const translations = typeof a.translations === 'string' ? JSON.parse(a.translations) : a.translations;
        return {
            title: (language !== 'en' && translations?.[language]?.title) || a.title,
            excerpt: (language !== 'en' && translations?.[language]?.excerpt) || a.excerpt || '',
            image: a.image || '/images/blog/placeholder.jpg',
            date: a.date,
            slug: a.slug
        };
    }) : (fallbackArticles[language as keyof typeof fallbackArticles] || fallbackArticles.en);

    const titles = {
        ar: { badge: "المدونة", title: "آخر الأخبار والمقالات", readMore: "اقرأ المزيد" },
        fr: { badge: "Blog", title: "Dernières Nouvelles et Articles", readMore: "Lire Plus" },
        en: { badge: "Blog", title: "Latest News and Articles", readMore: "Read More" }
    };

    const text = titles[language as keyof typeof titles] || titles.en;

    return (
        <section className="py-8 bg-gray-50 border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-6">
                    <span className="text-[var(--honey-gold)] uppercase tracking-[0.2em] text-xs font-bold">
                        {text.badge}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-serif text-[var(--coffee-brown)] mt-4">
                        {text.title}
                    </h2>
                </div>

                <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 pb-6 md:pb-0 hide-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
                    {displayArticles.map((article: Article, index: number) => (
                        <article
                            key={index}
                            className="flex-shrink-0 w-[280px] md:w-auto bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group border border-gray-100"
                        >
                            <div className="relative aspect-video overflow-hidden bg-gray-100">
                                <Image
                                    src={article.image}
                                    alt={article.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 280px, 33vw"
                                />
                            </div>
                            <div className="p-6 space-y-3 md:space-y-4">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    <time>{article.date}</time>
                                </div>
                                <h3 className="text-lg md:text-xl font-serif text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors line-clamp-2">
                                    {article.title}
                                </h3>
                                <p className="text-sm text-gray-600 line-clamp-2 md:line-clamp-3 leading-relaxed">
                                    {article.excerpt}
                                </p>
                                <Link
                                    href={`/blog/${article.slug}`}
                                    className="inline-flex items-center gap-2 text-[var(--honey-gold)] text-sm font-bold uppercase tracking-wider group-hover:gap-3 transition-all"
                                >
                                    {text.readMore}
                                    {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
