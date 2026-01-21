import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import * as motion from "framer-motion/client";

// Client-side wrapper for framer-motion to avoid SSR issues with 'framer-motion/client'
const MotionDiv = motion.div;

// Translation logic (assuming t is available or we pass it down if this was a client component)
// Since this is a server component, we might mock `t` or use the direct strings.
const t = (key: string, fallback: string) => fallback;

export const metadata: Metadata = {
    title: 'قصتنا | متجر يمني في أوروبا',
    description: 'تعرف على قصتنا. نحن متجر يمني يوفر أجود المنتجات اليمنية في أوروبا.',
};

async function getPageContent() {
    const page = await prisma.page.findUnique({
        where: { slug: 'our-story' }
    });
    return page;
}

export default async function OurStoryPage() {
    const page = await getPageContent();

    if (!page || !page.isActive) {
        return notFound();
    }


    const structured = page.structured_content as any;

    if (structured) {
        return (
            <main className="min-h-screen bg-[var(--cream-white)] text-[var(--coffee-brown)] overflow-x-hidden">
                {/* Hero Section with Parallax Effect */}
                <div className="relative h-[90vh] w-full overflow-hidden">
                    <div className="absolute inset-0">
                        <img
                            src={structured.hero.image}
                            alt={structured.hero.title}
                            className="object-cover w-full h-full scale-105 animate-slow-zoom"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-10">
                        <MotionDiv
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="max-w-4xl space-y-8"
                        >
                            <span className="block text-[var(--honey-gold)] text-sm md:text-base font-medium tracking-[0.3em] uppercase mb-4">
                                {t ? t('common.est', 'Est. 2024') : 'Established 2024'}
                            </span>
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] tracking-tight drop-shadow-lg">
                                {structured.hero.title}
                            </h1>
                            <div className="w-24 h-1 bg-[var(--honey-gold)] mx-auto mt-8 mb-8" />
                            <p className="text-lg md:text-2xl text-white/90 font-light leading-relaxed max-w-2xl mx-auto drop-shadow-md">
                                {structured.hero.subtitle}
                            </p>
                        </MotionDiv>
                    </div>

                    {/* Scroll Indicator */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/70">
                        <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent mx-auto" />
                    </div>
                </div>

                {/* Content Sections */}
                <div className="max-w-7xl mx-auto py-32 px-6 sm:px-12 space-y-40">
                    {structured.sections.map((section: any, idx: number) => (
                        <div key={idx}>
                            {section.type === 'image-text' && (
                                <div className={`flex flex-col md:flex-row gap-12 lg:gap-24 items-center ${section.imagePosition === 'left' ? '' : 'md:flex-row-reverse'}`}>

                                    {/* Image with Decorative Frame */}
                                    <div className={`w-full md:w-1/2 relative group ${section.imagePosition === 'left' ? 'md:order-1' : 'md:order-2'}`}>
                                        <MotionDiv
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.7 }}
                                        >
                                            <div className="relative aspect-[3/4] overflow-hidden rounded-sm shadow-2xl">
                                                <img
                                                    src={section.image}
                                                    alt={section.title}
                                                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 border-[1px] border-white/20 m-4 pointer-events-none" />
                                            </div>
                                            {/* Decorative Background Element */}
                                            <div className={`absolute -z-10 top-[-20px] ${section.imagePosition === 'left' ? 'left-[-20px]' : 'right-[-20px]'} w-full h-full border-2 border-[var(--coffee-brown)]/10`} />
                                        </MotionDiv>
                                    </div>

                                    {/* Text Content */}
                                    <div className={`w-full md:w-1/2 space-y-8 ${section.imagePosition === 'left' ? 'md:order-2' : 'md:order-1'}`}>
                                        <MotionDiv
                                            initial={{ opacity: 0, x: section.imagePosition === 'left' ? 30 : -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.7, delay: 0.2 }}
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className="w-12 h-[1px] bg-[var(--coffee-brown)]"></span>
                                                <span className="text-[var(--coffee-brown)] text-xs font-bold uppercase tracking-widest opacity-60">Chapter 0{idx + 1}</span>
                                            </div>
                                            <h2 className="text-4xl md:text-6xl font-serif text-[var(--coffee-brown)] leading-tight">
                                                {section.title}
                                            </h2>
                                            <p className="text-lg md:text-xl text-[var(--coffee-brown)]/75 leading-relaxed font-light text-justify">
                                                {section.content}
                                            </p>
                                        </MotionDiv>
                                    </div>
                                </div>
                            )}

                            {section.type === 'grid' && (
                                <div className="space-y-20">
                                    <MotionDiv
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="text-center space-y-6 max-w-3xl mx-auto"
                                    >
                                        <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.2em]">Our Collections</span>
                                        <h2 className="text-4xl md:text-6xl font-serif text-[var(--coffee-brown)]">{section.title}</h2>
                                        <div className="w-16 h-[2px] bg-[var(--coffee-brown)]/20 mx-auto"></div>
                                    </MotionDiv>

                                    <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
                                        {section.items.map((item: any, i: number) => (
                                            <MotionDiv
                                                key={i}
                                                initial={{ opacity: 0, y: 30 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.15 }}
                                                className="bg-white p-10 shadow-lg hover:shadow-xl transition-shadow duration-300 border-t-4 border-[var(--honey-gold)] text-center group cursor-default"
                                            >
                                                <div className="w-16 h-16 bg-[var(--bg-cream)] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-[var(--coffee-brown)] transition-colors duration-300">
                                                    <span className="text-2xl text-[var(--coffee-brown)] group-hover:text-white transition-colors duration-300">{i + 1}</span>
                                                </div>
                                                <h3 className="text-2xl font-serif text-[var(--coffee-brown)] mb-4">{item.title}</h3>
                                                <p className="text-[var(--coffee-brown)]/70 leading-relaxed font-light text-sm">
                                                    {item.content}
                                                </p>
                                            </MotionDiv>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Conclusion with Signature Style */}
                    <MotionDiv
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-center max-w-4xl mx-auto py-20 bg-[var(--coffee-brown)] text-[var(--cream-white)] rounded-tl-[80px] rounded-br-[80px] shadow-2xl relative overflow-hidden px-8 md:px-20"
                    >
                        {/* Abstract Patterns */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-[var(--honey-gold)]/10 rounded-full blur-3xl" />

                        <div className="relative z-10 space-y-10">
                            <h2 className="text-4xl md:text-5xl font-serif text-[var(--honey-gold)]">{structured.conclusion.title}</h2>
                            <p className="text-xl md:text-2xl font-light leading-relaxed opacity-90 italic">
                                "{structured.conclusion.content}"
                            </p>
                            <div className="pt-8">
                                <span className="font-serif text-3xl opacity-50 block mb-2">Yem Kaf</span>
                                <span className="text-xs uppercase tracking-[0.4em] opacity-40">Authentic Yemeni Heritage</span>
                            </div>
                        </div>
                    </MotionDiv>
                </div>
            </main>
        );
    }

    // Fallback to HTML content
    return (
        <main className="min-h-screen bg-white pt-32">
            <article>
                {/* Dynamically rendered content from CMS */}
                <div
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                    className="cms-content"
                />
            </article>
        </main>
    );
}
