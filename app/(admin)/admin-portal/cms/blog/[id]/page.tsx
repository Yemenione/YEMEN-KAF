import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BlogForm from "../BlogForm";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await prisma.blogPost.findUnique({
        where: { id: parseInt(id) }
    });

    if (!post) notFound();

    return <BlogForm post={JSON.parse(JSON.stringify(post))} />;
}
