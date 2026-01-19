'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getBlogPosts(limit = 3) {
    try {
        return await prisma.blogPost.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' },
            take: limit
        });
    } catch (error) {
        console.error("Error fetching blog posts:", error);
        return [];
    }
}

export async function getAllBlogPosts() {
    try {
        return await prisma.blogPost.findMany({
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching all blog posts:", error);
        return [];
    }
}

interface BlogPostInput {
    title: string;
    content: string;
    excerpt?: string;
    image?: string;
    status: 'DRAFT' | 'PUBLISHED';
    slug: string;
    author?: string;
    readTime?: string;
    tags?: string; // JSON string or array
    categoryId?: number;
    publishedAt?: Date | string | null;
}

export async function createBlogPost(data: BlogPostInput) {
    try {
        const post = await prisma.blogPost.create({
            data: {
                ...data,
                publishedAt: data.status === 'PUBLISHED' ? new Date() : null
            }
        });
        revalidatePath('/admin-portal/cms/blog');
        revalidatePath('/'); // Revalidate home blog section
        return { success: true, post };
    } catch (error) {
        console.error("Error creating blog post:", error);
        return { success: false, error: "Failed to create post" };
    }
}

export async function updateBlogPost(id: number, data: Partial<BlogPostInput>) {
    try {
        const post = await prisma.blogPost.update({
            where: { id },
            data: {
                ...data,
                publishedAt: data.status === 'PUBLISHED' && !data.publishedAt ? new Date() : data.publishedAt
            }
        });
        revalidatePath('/admin-portal/cms/blog');
        revalidatePath('/');
        return { success: true, post };
    } catch (error) {
        console.error("Error updating blog post:", error);
        return { success: false, error: "Failed to update post" };
    }
}

export async function deleteBlogPost(id: number) {
    try {
        await prisma.blogPost.delete({ where: { id } });
        revalidatePath('/admin-portal/cms/blog');
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error("Error deleting blog post:", error);
        return { success: false, error: "Failed to delete post" };
    }
}
