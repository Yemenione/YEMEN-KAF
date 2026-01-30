import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { notFound } from "next/navigation";

export async function generateMetadata() {
    return {
        title: 'Mentions Légales | Yemen Kaf',
        description: 'Mentions légales et informations sur l\'éditeur du site yemenimarket.fr',
    };
}

export default async function MentionsLegalesPage() {
    const page = await prisma.page.findUnique({
        where: { slug: 'mentions-legales' }
    });

    if (!page || !page.isActive) {
        // Fallback or 404
        return notFound();
    }

    return (
        <main className="min-h-screen bg-white">
            <Navbar theme="dark" />
            <div className="max-w-4xl mx-auto px-6 pt-32 pb-20">
                <h1 className="text-4xl font-serif mb-8 text-black">{page.title}</h1>
                <div
                    className="prose prose-lg text-gray-700 space-y-8 cms-content"
                    dangerouslySetInnerHTML={{ __html: page.content || '' }}
                />
            </div>
            <Footer />
        </main>
    );
}
