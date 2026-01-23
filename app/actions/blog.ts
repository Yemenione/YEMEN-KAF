'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_cache } from "next/cache";

export const getBlogPosts = unstable_cache(
    async (limit = 3) => {
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
    },
    ['home-blog-posts'],
    { revalidate: 3600, tags: ['blog'] }
);

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

export async function getPublishedBlogPosts() {
    try {
        return await prisma.blogPost.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { publishedAt: 'desc' }
        });
    } catch (error) {
        console.error("Error fetching published blog posts:", error);
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
    category?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    translations?: any;
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
        revalidatePath('/blog');
        revalidatePath('/');
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
        revalidatePath(`/blog/${post.slug}`);
        revalidatePath('/blog');
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

export async function getBlogPostBySlug(slug: string) {
    try {
        return await prisma.blogPost.findUnique({
            where: { slug }
        });
    } catch (error) {
        console.error("Error fetching blog post by slug:", error);
        return null;
    }
}
