import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import FarmsContent from "@/components/shop/FarmsContent";

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
    let structured = (page as any).structured_content as unknown as StructuredFarmsData;

    // Handle case where structured_content might be a string (SQLite/older versions)
    if (typeof structured === 'string') {
        try {
            structured = JSON.parse(structured);
        } catch (e) {
            console.error("Failed to parse structured_content:", e);
        }
    }

    if (structured && Array.isArray(structured.sections)) {
        return (
            <FarmsContent sections={structured.sections.map(s => ({ image: s.image, theme: s.theme }))} />
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
