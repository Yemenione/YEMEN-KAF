import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url: string;
}

export default function CategoriesSection() {
    const [categories, setCategories] = useState<Category[]>([]);
    const { t } = useLanguage();
    const { settings } = useSettings();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/categories');
                if (res.ok) {
                    const data = await res.json();
                    let cats = data.categories || [];

                    if (settings.homepage_featured_categories) {
                        const ids = JSON.parse(settings.homepage_featured_categories);
                        if (Array.isArray(ids) && ids.length > 0) {
                            cats = cats.filter((c: any) => ids.includes(c.id));
                        }
                    }

                    setCategories(cats);
                }
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            }
        };

        fetchCategories();
    }, [settings.homepage_featured_categories]);

    if (categories.length === 0) return null;

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
                <div>
                    <span className="text-gray-400 uppercase tracking-[0.4em] text-xs font-semibold block mb-4">{t('home.categories.discover')}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-black leading-tight">{t('home.categories.title')}</h2>
                </div>
                {/* Scroll Indicators (Visual only, native scroll used) */}
                <div className="hidden md:flex gap-2">
                    <span className="text-sm font-medium text-gray-400">{t('home.categories.scroll')}</span>
                    <ArrowUpRight className="w-5 h-5 text-gray-400 rotate-90" />
                </div>
            </div>

            {/* Horizontal Scroll Container */}
            <div className="w-full overflow-x-auto pb-12 hide-scrollbar">
                <div className="flex gap-6 px-6 md:px-0 max-w-7xl mx-auto min-w-max">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="group block relative w-[280px] md:w-[350px] aspect-[3/4] flex-shrink-0 overflow-hidden bg-gray-100 rounded-lg"
                        >
                            <Image
                                src={cat.image_url || '/images/honey-jar.jpg'}
                                alt={cat.name}
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                sizes="(max-width: 768px) 70vw, 25vw"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col justify-end p-8 text-white z-10">
                                <span className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--honey-gold)] mb-2">
                                    {t('home.categories.explore')}
                                </span>
                                <h3 className="text-2xl font-serif mb-2 transform translate-y-0 group-hover:-translate-y-1 transition-transform duration-500">{cat.name}</h3>
                                <p className="text-white/70 text-sm font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-2">
                                    {cat.description}
                                </p>
                            </div>

                            {/* Arrow Icon */}
                            <div className="absolute top-6 right-6 z-20">
                                <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white group-hover:text-black transition-all duration-500">
                                    <ArrowUpRight size={18} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
