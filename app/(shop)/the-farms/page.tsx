import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import * as motion from "framer-motion/client";

// Client-side wrapper for framer-motion to avoid SSR issues with 'framer-motion/client'
const MotionDiv = motion.div;

export const metadata: Metadata = {
    title: 'مزارعنا | متجر يمني في أوروبا',
    description: 'اكتشف مصادر منتجاتنا من وادي دوعن وجبال حراز.',
};

interface StructuredFarmsData {
    hero: {
        tagline: string;
        title: string;
        subtitle: string;
    };
    sections: Array<{
        theme: string;
        image: string;
        title: string;
        subtitle: string;
        content: string;
        features?: string[];
    }>;
    cta?: string;
}

async function getPageContent() {
    const page = await prisma.page.findUnique({
        where: { slug: 'the-farms' }
    });
    return page;
}

export default async function TheFarmsPage() {
    const page = await getPageContent();

    if (!page || !page.isActive) {
        return notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const structured = (page as any).structured_content as unknown as StructuredFarmsData;

    if (structured) {
        return (
            <main className="min-h-screen bg-white">
                {/* Hero */}
                <div className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto space-y-6">
                    <span className="text-[var(--honey-gold)] text-xs font-bold uppercase tracking-[0.4em]">{structured.hero.tagline}</span>
                    <h1 className="text-6xl md:text-8xl font-serif text-[var(--coffee-brown)]">{structured.hero.title}</h1>
                    <p className="text-[var(--coffee-brown)]/60 text-lg leading-relaxed">
                        {structured.hero.subtitle}
                    </p>
                </div>

                {/* Regions */}
                {structured.sections.map((section, idx) => (
                    <section key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-0 min-h-[80vh] overflow-hidden">
                        {/* Image Side - Sticky Effect */}
                        <div className={`relative min-h-[50vh] ${section.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} ${idx % 2 === 1 ? 'md:order-2' : 'md:order-1'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={section.image} alt={section.title} className="object-cover w-full h-full" />
                        </div>

                        {/* Content Side */}
                        <div className={`flex items-center justify-center p-12 md:p-24 ${section.theme === 'dark' ? 'bg-[var(--coffee-brown)] text-white' : 'bg-white text-[var(--coffee-brown)]'} ${idx % 2 === 1 ? 'md:order-1' : 'md:order-2'}`}>
                            <MotionDiv
                                initial={{ opacity: 0, x: idx % 2 === 1 ? -50 : 50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6 max-w-md"
                            >
                                <div className="flex items-center gap-2 text-[var(--honey-gold)]">
                                    <span className="text-xs font-bold uppercase tracking-widest">{section.subtitle}</span>
                                </div>
                                <h2 className="text-4xl font-serif">{section.title}</h2>
                                <p className={`leading-relaxed ${section.theme === 'dark' ? 'text-white/70' : 'text-[var(--coffee-brown)]/70'}`}>
                                    {section.content}
                                </p>
                                <ul className="space-y-2 pt-4">
                                    {section.features && section.features.map((feature, fIdx) => (
                                        <li key={fIdx} className="flex items-center gap-2 text-sm font-medium opacity-80">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[var(--honey-gold)]" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </MotionDiv>
                        </div>
                    </section>
                ))}
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
