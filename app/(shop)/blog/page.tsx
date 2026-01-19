"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Calendar, ArrowRight, Clock } from "lucide-react";

// Interface removed (unused)

export default function BlogPage() {
    const { language } = useLanguage();

    const articlesData = {
        ar: [
            {
                title: "فوائد العسل اليمني الصحية",
                excerpt: "اكتشف الفوائد الصحية المذهلة للعسل اليمني الطبيعي وكيف يمكن أن يحسن صحتك اليومية. العسل اليمني معروف بخصائصه العلاجية الفريدة.",
                image: "/images/blog/honey-benefits.jpg",
                date: "15 يناير 2026",
                slug: "honey-health-benefits",
                readTime: "5 دقائق",
                category: "الصحة"
            },
            {
                title: "كيف تختار البخور الأصيل",
                excerpt: "دليل شامل لاختيار البخور اليمني الأصلي والتمييز بين الأنواع المختلفة. تعرف على أسرار البخور التقليدي.",
                image: "/images/blog/incense-guide.jpg",
                date: "10 يناير 2026",
                slug: "authentic-incense-guide",
                readTime: "7 دقائق",
                category: "دليل الشراء"
            },
            {
                title: "تاريخ القهوة اليمنية",
                excerpt: "رحلة عبر تاريخ القهوة اليمنية العريق وكيف أصبحت من أفضل أنواع القهوة في العالم. قصة القهوة من اليمن إلى العالم.",
                image: "/images/blog/coffee-history.jpg",
                date: "5 يناير 2026",
                slug: "yemeni-coffee-history",
                readTime: "6 دقائق",
                category: "التاريخ"
            },
            {
                title: "وصفات تقليدية بالعسل اليمني",
                excerpt: "أفضل الوصفات التقليدية التي تستخدم العسل اليمني. من الحلويات إلى المشروبات الصحية.",
                image: "/images/blog/honey-benefits.jpg",
                date: "1 يناير 2026",
                slug: "honey-recipes",
                readTime: "8 دقائق",
                category: "وصفات"
            },
            {
                title: "فوائد البخور للصحة النفسية",
                excerpt: "كيف يساعد البخور اليمني التقليدي على الاسترخاء وتحسين الحالة المزاجية.",
                image: "/images/blog/incense-guide.jpg",
                date: "28 ديسمبر 2025",
                slug: "incense-mental-health",
                readTime: "5 دقائق",
                category: "الصحة"
            },
            {
                title: "دليل تحضير القهوة اليمنية",
                excerpt: "الطريقة التقليدية لتحضير القهوة اليمنية الأصيلة في المنزل.",
                image: "/images/blog/coffee-history.jpg",
                date: "25 ديسمبر 2025",
                slug: "coffee-brewing-guide",
                readTime: "6 دقائق",
                category: "دليل الشراء"
            }
        ],
        fr: [
            {
                title: "Bienfaits du Miel Yéménite",
                excerpt: "Découvrez les bienfaits extraordinaires du miel yéménite naturel pour votre santé quotidienne. Le miel yéménite est reconnu pour ses propriétés thérapeutiques uniques.",
                image: "/images/blog/honey-benefits.jpg",
                date: "15 janvier 2026",
                slug: "honey-health-benefits",
                readTime: "5 min",
                category: "Santé"
            },
            {
                title: "Comment Choisir l'Encens Authentique",
                excerpt: "Guide complet pour choisir l'encens yéménite authentique et distinguer les différentes variétés. Découvrez les secrets de l'encens traditionnel.",
                image: "/images/blog/incense-guide.jpg",
                date: "10 janvier 2026",
                slug: "authentic-incense-guide",
                readTime: "7 min",
                category: "Guide d'Achat"
            },
            {
                title: "Histoire du Café Yéménite",
                excerpt: "Voyage à travers l'histoire riche du café yéménite et comment il est devenu l'un des meilleurs au monde. L'histoire du café du Yémen au monde.",
                image: "/images/blog/coffee-history.jpg",
                date: "5 janvier 2026",
                slug: "yemeni-coffee-history",
                readTime: "6 min",
                category: "Histoire"
            },
            {
                title: "Recettes Traditionnelles au Miel",
                excerpt: "Les meilleures recettes traditionnelles utilisant le miel yéménite. Des desserts aux boissons santé.",
                image: "/images/blog/honey-benefits.jpg",
                date: "1 janvier 2026",
                slug: "honey-recipes",
                readTime: "8 min",
                category: "Recettes"
            },
            {
                title: "Bienfaits de l'Encens pour la Santé Mentale",
                excerpt: "Comment l'encens yéménite traditionnel aide à la relaxation et améliore l'humeur.",
                image: "/images/blog/incense-guide.jpg",
                date: "28 décembre 2025",
                slug: "incense-mental-health",
                readTime: "5 min",
                category: "Santé"
            },
            {
                title: "Guide de Préparation du Café Yéménite",
                excerpt: "La méthode traditionnelle pour préparer le café yéménite authentique à la maison.",
                image: "/images/blog/coffee-history.jpg",
                date: "25 décembre 2025",
                slug: "coffee-brewing-guide",
                readTime: "6 min",
                category: "Guide d'Achat"
            }
        ],
        en: [
            {
                title: "Health Benefits of Yemeni Honey",
                excerpt: "Discover the amazing health benefits of natural Yemeni honey and how it can improve your daily wellness. Yemeni honey is known for its unique therapeutic properties.",
                image: "/images/blog/honey-benefits.jpg",
                date: "January 15, 2026",
                slug: "honey-health-benefits",
                readTime: "5 min",
                category: "Health"
            },
            {
                title: "How to Choose Authentic Incense",
                excerpt: "Complete guide to choosing authentic Yemeni incense and distinguishing between different varieties. Learn the secrets of traditional incense.",
                image: "/images/blog/incense-guide.jpg",
                date: "January 10, 2026",
                slug: "authentic-incense-guide",
                readTime: "7 min",
                category: "Buying Guide"
            },
            {
                title: "History of Yemeni Coffee",
                excerpt: "Journey through the rich history of Yemeni coffee and how it became one of the world's finest. The story of coffee from Yemen to the world.",
                image: "/images/blog/coffee-history.jpg",
                date: "January 5, 2026",
                slug: "yemeni-coffee-history",
                readTime: "6 min",
                category: "History"
            },
            {
                title: "Traditional Recipes with Yemeni Honey",
                excerpt: "The best traditional recipes using Yemeni honey. From desserts to healthy drinks.",
                image: "/images/blog/honey-benefits.jpg",
                date: "January 1, 2026",
                slug: "honey-recipes",
                readTime: "8 min",
                category: "Recipes"
            },
            {
                title: "Incense Benefits for Mental Health",
                excerpt: "How traditional Yemeni incense helps with relaxation and improves mood.",
                image: "/images/blog/incense-guide.jpg",
                date: "December 28, 2025",
                slug: "incense-mental-health",
                readTime: "5 min",
                category: "Health"
            },
            {
                title: "Yemeni Coffee Brewing Guide",
                excerpt: "The traditional method for preparing authentic Yemeni coffee at home.",
                image: "/images/blog/coffee-history.jpg",
                date: "December 25, 2025",
                slug: "coffee-brewing-guide",
                readTime: "6 min",
                category: "Buying Guide"
            }
        ]
    };

    const articles = articlesData[language as keyof typeof articlesData] || articlesData.en;

    const titles = {
        ar: {
            title: "المدونة",
            subtitle: "مقالات ونصائح حول المنتجات اليمنية التقليدية",
            allCategories: "جميع الفئات"
        },
        fr: {
            title: "Blog",
            subtitle: "Articles et conseils sur les produits traditionnels yéménites",
            allCategories: "Toutes les Catégories"
        },
        en: {
            title: "Blog",
            subtitle: "Articles and tips about traditional Yemeni products",
            allCategories: "All Categories"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map((article, index) => (
                            <Link
                                key={index}
                                href={`/blog/${article.slug}`}
                                className="group bg-white rounded-xl overflow-hidden border border-gray-100 hover:border-[var(--honey-gold)] transition-all duration-500 hover:shadow-2xl"
                            >
                                <div className="relative aspect-video overflow-hidden bg-gray-100">
                                    <Image
                                        src={article.image}
                                        alt={article.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                    <div className="absolute top-4 start-4 bg-[var(--honey-gold)] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">
                                        {article.category}
                                    </div>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <time>{article.date}</time>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{article.readTime}</span>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-serif text-[var(--coffee-brown)] group-hover:text-[var(--honey-gold)] transition-colors line-clamp-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-600 line-clamp-3 leading-relaxed">
                                        {article.excerpt}
                                    </p>
                                    <div className="flex items-center gap-2 text-[var(--honey-gold)] font-bold text-sm uppercase tracking-wider pt-2">
                                        {language === 'ar' ? 'اقرأ المزيد' : language === 'fr' ? 'Lire Plus' : 'Read More'}
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
