"use client";

import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react";
import { use } from "react";

interface ArticleContent {
    title: string;
    excerpt: string;
    image: string;
    date: string;
    readTime: string;
    category: string;
    content: string[];
}

const articlesDatabase: Record<string, Record<string, ArticleContent>> = {
    "honey-health-benefits": {
        ar: {
            title: "فوائد العسل اليمني الصحية",
            excerpt: "اكتشف الفوائد الصحية المذهلة للعسل اليمني الطبيعي",
            image: "/images/blog/honey-benefits.jpg",
            date: "15 يناير 2026",
            readTime: "5 دقائق",
            category: "الصحة",
            content: [
                "العسل اليمني يعتبر من أجود أنواع العسل في العالم، وذلك بفضل التنوع البيئي الفريد في اليمن والنباتات البرية التي تتغذى عليها النحل.",
                "## الفوائد الصحية الرئيسية",
                "### 1. تقوية جهاز المناعة",
                "يحتوي العسل اليمني على مضادات أكسدة قوية تساعد في تقوية جهاز المناعة ومكافحة الأمراض. الاستهلاك المنتظم للعسل يمكن أن يقلل من خطر الإصابة بالعدوى.",
                "### 2. علاج مشاكل الجهاز الهضمي",
                "العسل اليمني معروف بخصائصه العلاجية للجهاز الهضمي. يساعد في علاج القرحة، والتهاب المعدة، ويحسن عملية الهضم بشكل عام.",
                "### 3. مصدر طبيعي للطاقة",
                "بفضل محتواه العالي من السكريات الطبيعية، يعتبر العسل اليمني مصدراً ممتازاً للطاقة السريعة والمستدامة، مما يجعله مثالياً للرياضيين.",
                "### 4. خصائص مضادة للبكتيريا",
                "يحتوي على مركبات طبيعية مضادة للبكتيريا والفطريات، مما يجعله علاجاً فعالاً للجروح والحروق الخفيفة.",
                "## كيفية استخدام العسل اليمني",
                "- تناول ملعقة صغيرة على الريق يومياً\n- إضافته إلى المشروبات الدافئة (ليس الساخنة جداً)\n- استخدامه كبديل طبيعي للسكر في الوصفات\n- تطبيقه موضعياً على الجروح الصغيرة",
                "## الخلاصة",
                "العسل اليمني ليس مجرد طعام لذيذ، بل هو دواء طبيعي متكامل. احرص على اختيار العسل الأصلي من مصادر موثوقة للحصول على أقصى فائدة."
            ]
        },
        fr: {
            title: "Bienfaits du Miel Yéménite pour la Santé",
            excerpt: "Découvrez les bienfaits extraordinaires du miel yéménite naturel",
            image: "/images/blog/honey-benefits.jpg",
            date: "15 janvier 2026",
            readTime: "5 min",
            category: "Santé",
            content: [
                "Le miel yéménite est considéré comme l'un des meilleurs miels au monde, grâce à la diversité environnementale unique du Yémen et aux plantes sauvages dont se nourrissent les abeilles.",
                "## Principaux Bienfaits pour la Santé",
                "### 1. Renforcement du Système Immunitaire",
                "Le miel yéménite contient de puissants antioxydants qui aident à renforcer le système immunitaire et à combattre les maladies. Une consommation régulière peut réduire le risque d'infections.",
                "### 2. Traitement des Problèmes Digestifs",
                "Le miel yéménite est reconnu pour ses propriétés thérapeutiques sur le système digestif. Il aide à traiter les ulcères, la gastrite et améliore la digestion en général.",
                "### 3. Source Naturelle d'Énergie",
                "Grâce à sa haute teneur en sucres naturels, le miel yéménite est une excellente source d'énergie rapide et durable, idéale pour les athlètes.",
                "### 4. Propriétés Antibactériennes",
                "Il contient des composés naturels antibactériens et antifongiques, ce qui en fait un traitement efficace pour les plaies et brûlures légères.",
                "## Comment Utiliser le Miel Yéménite",
                "- Prendre une cuillère à café à jeun quotidiennement\n- L'ajouter aux boissons chaudes (pas trop chaudes)\n- L'utiliser comme substitut naturel du sucre dans les recettes\n- L'appliquer localement sur les petites plaies",
                "## Conclusion",
                "Le miel yéménite n'est pas seulement un aliment délicieux, c'est un médicament naturel complet. Assurez-vous de choisir du miel authentique de sources fiables pour en tirer le maximum de bénéfices."
            ]
        },
        en: {
            title: "Health Benefits of Yemeni Honey",
            excerpt: "Discover the amazing health benefits of natural Yemeni honey",
            image: "/images/blog/honey-benefits.jpg",
            date: "January 15, 2026",
            readTime: "5 min",
            category: "Health",
            content: [
                "Yemeni honey is considered one of the finest honeys in the world, thanks to Yemen's unique environmental diversity and the wild plants that bees feed on.",
                "## Main Health Benefits",
                "### 1. Immune System Boost",
                "Yemeni honey contains powerful antioxidants that help strengthen the immune system and fight diseases. Regular consumption can reduce the risk of infections.",
                "### 2. Digestive System Treatment",
                "Yemeni honey is known for its therapeutic properties on the digestive system. It helps treat ulcers, gastritis, and improves digestion overall.",
                "### 3. Natural Energy Source",
                "Thanks to its high natural sugar content, Yemeni honey is an excellent source of quick and sustained energy, making it ideal for athletes.",
                "### 4. Antibacterial Properties",
                "It contains natural antibacterial and antifungal compounds, making it an effective treatment for minor wounds and burns.",
                "## How to Use Yemeni Honey",
                "- Take a teaspoon on an empty stomach daily\n- Add it to warm drinks (not too hot)\n- Use it as a natural sugar substitute in recipes\n- Apply it topically to small wounds",
                "## Conclusion",
                "Yemeni honey is not just a delicious food, it's a complete natural medicine. Make sure to choose authentic honey from reliable sources to get maximum benefits."
            ]
        }
    },
    "authentic-incense-guide": {
        ar: {
            title: "كيف تختار البخور الأصيل",
            excerpt: "دليل شامل لاختيار البخور اليمني الأصلي",
            image: "/images/blog/incense-guide.jpg",
            date: "10 يناير 2026",
            readTime: "7 دقائق",
            category: "دليل الشراء",
            content: [
                "البخور اليمني التقليدي له تاريخ عريق يمتد لآلاف السنين. في هذا الدليل، سنتعرف على كيفية اختيار البخور الأصيل وتمييزه عن المقلد.",
                "## أنواع البخور اليمني",
                "### 1. بخور العود",
                "العود اليمني من أجود أنواع العود في العالم، يتميز برائحته القوية والمميزة.",
                "### 2. اللبان",
                "اللبان اليمني معروف بجودته العالية ورائحته الزكية التي تستخدم في المناسبات الخاصة.",
                "### 3. المر",
                "المر اليمني له خصائص علاجية بالإضافة إلى رائحته المميزة.",
                "## كيف تتعرف على البخور الأصيل",
                "- اللون الطبيعي (ليس صناعياً)\n- الرائحة القوية والنقية\n- الملمس الطبيعي\n- المصدر الموثوق",
                "## نصائح الاستخدام",
                "استخدم البخور في مكان جيد التهوية، وابدأ بكمية صغيرة لتجنب الرائحة القوية جداً."
            ]
        },
        fr: {
            title: "Comment Choisir l'Encens Authentique",
            excerpt: "Guide complet pour choisir l'encens yéménite authentique",
            image: "/images/blog/incense-guide.jpg",
            date: "10 janvier 2026",
            readTime: "7 min",
            category: "Guide d'Achat",
            content: [
                "L'encens yéménite traditionnel a une histoire riche qui s'étend sur des milliers d'années. Dans ce guide, nous apprendrons à choisir l'encens authentique et à le distinguer des contrefaçons.",
                "## Types d'Encens Yéménite",
                "### 1. Encens d'Oud",
                "L'oud yéménite est l'un des meilleurs types d'oud au monde, caractérisé par son parfum fort et distinctif.",
                "### 2. Encens d'Oliban",
                "L'oliban yéménite est connu pour sa haute qualité et son parfum agréable utilisé lors d'occasions spéciales.",
                "### 3. Myrrhe",
                "La myrrhe yéménite a des propriétés thérapeutiques en plus de son parfum distinctif.",
                "## Comment Reconnaître l'Encens Authentique",
                "- Couleur naturelle (pas artificielle)\n- Parfum fort et pur\n- Texture naturelle\n- Source fiable",
                "## Conseils d'Utilisation",
                "Utilisez l'encens dans un endroit bien ventilé et commencez par une petite quantité pour éviter un parfum trop fort."
            ]
        },
        en: {
            title: "How to Choose Authentic Incense",
            excerpt: "Complete guide to choosing authentic Yemeni incense",
            image: "/images/blog/incense-guide.jpg",
            date: "January 10, 2026",
            readTime: "7 min",
            category: "Buying Guide",
            content: [
                "Traditional Yemeni incense has a rich history spanning thousands of years. In this guide, we'll learn how to choose authentic incense and distinguish it from counterfeits.",
                "## Types of Yemeni Incense",
                "### 1. Oud Incense",
                "Yemeni oud is one of the finest types of oud in the world, characterized by its strong and distinctive fragrance.",
                "### 2. Frankincense",
                "Yemeni frankincense is known for its high quality and pleasant fragrance used on special occasions.",
                "### 3. Myrrh",
                "Yemeni myrrh has therapeutic properties in addition to its distinctive fragrance.",
                "## How to Recognize Authentic Incense",
                "- Natural color (not artificial)\n- Strong and pure fragrance\n- Natural texture\n- Reliable source",
                "## Usage Tips",
                "Use incense in a well-ventilated area and start with a small amount to avoid an overly strong fragrance."
            ]
        }
    },
    "yemeni-coffee-history": {
        ar: {
            title: "تاريخ القهوة اليمنية",
            excerpt: "رحلة عبر تاريخ القهوة اليمنية العريق",
            image: "/images/blog/coffee-history.jpg",
            date: "5 يناير 2026",
            readTime: "6 دقائق",
            category: "التاريخ",
            content: [
                "القهوة اليمنية لها تاريخ عريق يعود لمئات السنين. اليمن هو موطن القهوة الأصلي، ومنه انتشرت إلى العالم.",
                "## بداية القهوة في اليمن",
                "تعود زراعة القهوة في اليمن إلى القرن الخامس عشر، حيث كانت المناطق الجبلية المثالية لزراعة أجود أنواع البن.",
                "## انتشار القهوة اليمنية",
                "من ميناء المخا اليمني، انتشرت القهوة إلى العالم، ومن هنا جاءت تسمية 'موكا' الشهيرة.",
                "## الأصناف اليمنية المميزة",
                "- قهوة حراز\n- قهوة بني مطر\n- قهوة يافع\n- قهوة حيمة",
                "## الطريقة التقليدية",
                "القهوة اليمنية تُحضر بطريقة تقليدية فريدة، حيث تُحمص البن على نار الحطب وتُطحن يدوياً."
            ]
        },
        fr: {
            title: "Histoire du Café Yéménite",
            excerpt: "Voyage à travers l'histoire riche du café yéménite",
            image: "/images/blog/coffee-history.jpg",
            date: "5 janvier 2026",
            readTime: "6 min",
            category: "Histoire",
            content: [
                "Le café yéménite a une histoire riche remontant à des centaines d'années. Le Yémen est le berceau du café, d'où il s'est répandu dans le monde.",
                "## Débuts du Café au Yémen",
                "La culture du café au Yémen remonte au XVe siècle, où les régions montagneuses étaient idéales pour cultiver les meilleurs types de café.",
                "## Diffusion du Café Yéménite",
                "Du port de Mocha au Yémen, le café s'est répandu dans le monde, d'où le nom célèbre 'Moka'.",
                "## Variétés Yéménites Distinctives",
                "- Café Haraz\n- Café Bani Matar\n- Café Yafa\n- Café Haima",
                "## Méthode Traditionnelle",
                "Le café yéménite est préparé de manière traditionnelle unique, où les grains sont torréfiés sur feu de bois et moulus à la main."
            ]
        },
        en: {
            title: "History of Yemeni Coffee",
            excerpt: "Journey through the rich history of Yemeni coffee",
            image: "/images/blog/coffee-history.jpg",
            date: "January 5, 2026",
            readTime: "6 min",
            category: "History",
            content: [
                "Yemeni coffee has a rich history dating back hundreds of years. Yemen is the birthplace of coffee, from where it spread to the world.",
                "## Coffee Beginnings in Yemen",
                "Coffee cultivation in Yemen dates back to the 15th century, where mountainous regions were ideal for growing the finest coffee varieties.",
                "## Spread of Yemeni Coffee",
                "From the port of Mocha in Yemen, coffee spread to the world, hence the famous name 'Mocha'.",
                "## Distinctive Yemeni Varieties",
                "- Haraz Coffee\n- Bani Matar Coffee\n- Yafa Coffee\n- Haima Coffee",
                "## Traditional Method",
                "Yemeni coffee is prepared in a unique traditional way, where beans are roasted over wood fire and ground by hand."
            ]
        }
    }
};

export default function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params);
    const { language } = useLanguage();

    const article = articlesDatabase[slug]?.[language as keyof typeof articlesDatabase[typeof slug]] ||
        articlesDatabase[slug]?.en;

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

    const renderContent = (content: string) => {
        if (content.startsWith('##')) {
            return <h2 className="text-3xl font-serif text-[var(--coffee-brown)] mt-12 mb-6">{content.replace('## ', '')}</h2>;
        }
        if (content.startsWith('###')) {
            return <h3 className="text-2xl font-serif text-[var(--coffee-brown)] mt-8 mb-4">{content.replace('### ', '')}</h3>;
        }
        if (content.includes('\n-')) {
            const items = content.split('\n-').filter(Boolean);
            return (
                <ul className="list-disc list-inside space-y-2 text-gray-700 my-6">
                    {items.map((item, i) => <li key={i}>{item.trim()}</li>)}
                </ul>
            );
        }
        return <p className="text-gray-700 leading-relaxed mb-6">{content}</p>;
    };

    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Image */}
            <div className="relative h-[60vh] mt-20">
                <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                    <div className="max-w-4xl mx-auto">
                        <span className="inline-block bg-[var(--honey-gold)] text-white px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                            {article.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-serif text-white mb-4">
                            {article.title}
                        </h1>
                        <div className="flex items-center gap-6 text-white/90 text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <time>{article.date}</time>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{article.readTime}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Article Content */}
            <article className="py-16">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="prose prose-lg max-w-none" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                        {article.content.map((paragraph, index) => (
                            <div key={index}>
                                {renderContent(paragraph)}
                            </div>
                        ))}
                    </div>

                    {/* Share & Back */}
                    <div className="mt-16 pt-8 border-t border-gray-200 flex items-center justify-between">
                        <Link
                            href="/blog"
                            className="flex items-center gap-2 text-[var(--coffee-brown)] hover:text-[var(--honey-gold)] transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            {language === 'ar' ? 'العودة إلى المدونة' : language === 'fr' ? 'Retour au blog' : 'Back to blog'}
                        </Link>
                        <button className="flex items-center gap-2 text-gray-600 hover:text-[var(--honey-gold)] transition-colors">
                            <Share2 className="w-5 h-5" />
                            {language === 'ar' ? 'مشاركة' : language === 'fr' ? 'Partager' : 'Share'}
                        </button>
                    </div>
                </div>
            </article>
        </main>
    );
}
