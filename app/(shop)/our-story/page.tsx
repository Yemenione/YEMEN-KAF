import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import OurStoryContent from "@/components/shop/OurStoryContent";

export const metadata: Metadata = {
    title: 'قصتنا | متجر يمني في أوروبا',
    description: 'تعرف على قصتنا. نحن متجر يمني يوفر أجود المنتجات اليمنية في أوروبا.',
};

interface StructuredPageData {
    hero: {
        title: string;
        subtitle: string;
        image: string;
    };
    sections: Array<{
        type: 'image-text' | 'grid';
        title: string;
        content?: string;
        image?: string;
        imagePosition?: 'left' | 'right';
        items?: Array<{
            title: string;
            content: string;
        }>;
    }>;
    conclusion: {
        title: string;
        content: string;
    };
}

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


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const structured = (page as any).structured_content as unknown as StructuredPageData;

    if (structured) {
        return (
            <OurStoryContent
                hero={structured.hero}
                sections={structured.sections}
                conclusion={structured.conclusion}
            />
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


