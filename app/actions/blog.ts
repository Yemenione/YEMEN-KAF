'use server';

import pool from "@/lib/mysql";
import { revalidatePath, unstable_cache } from "next/cache";
import { RowDataPacket, ResultSetHeader } from "mysql2";

interface BlogPost extends RowDataPacket {
    id: number;
    title: string;
    slug: string;
    content: string;
    excerpt: string;
    image: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    published_at: Date;
    created_at: Date;
    author: string;
    category: string;
    translations: unknown;
}

export const getBlogPosts = unstable_cache(
    async (limit = 3) => {
        try {
            const [rows] = await pool.execute<BlogPost[]>(
                `SELECT * FROM blog_posts 
                 WHERE status = 'PUBLISHED' 
                 ORDER BY published_at DESC 
                 LIMIT ?`,
                [limit]
            );
            return rows.map(mapPost);
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
        const [rows] = await pool.execute<BlogPost[]>(
            `SELECT * FROM blog_posts ORDER BY created_at DESC`
        );
        return rows.map(mapPost);
    } catch (error) {
        console.error("Error fetching all blog posts:", error);
        return [];
    }
}

export async function getPublishedBlogPosts() {
    try {
        const [rows] = await pool.execute<BlogPost[]>(
            `SELECT * FROM blog_posts 
             WHERE status = 'PUBLISHED' 
             ORDER BY published_at DESC`
        );
        return rows.map(mapPost);
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
        const publishedAt = data.status === 'PUBLISHED' ? new Date() : null;

        const [result] = await pool.execute<ResultSetHeader>(
            `INSERT INTO blog_posts (title, slug, content, excerpt, image, status, published_at, author, category, translations, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [
                data.title,
                data.slug,
                data.content,
                data.excerpt || '',
                data.image || '',
                data.status,
                publishedAt,
                data.author || 'Yem Kaf',
                data.category || 'General',
                JSON.stringify(data.translations || {})
            ]
        );

        revalidatePath('/admin-portal/cms/blog');
        revalidatePath('/blog');
        revalidatePath('/');
        return { success: true, id: result.insertId };
    } catch (error) {
        console.error("Error creating blog post:", error);
        return { success: false, error: "Failed to create post" };
    }
}

export async function updateBlogPost(id: number, data: Partial<BlogPostInput>) {
    try {
        const updates: string[] = [];
        const values: unknown[] = [];

        if (data.title) { updates.push('title = ?'); values.push(data.title); }
        if (data.slug) { updates.push('slug = ?'); values.push(data.slug); }
        if (data.content) { updates.push('content = ?'); values.push(data.content); }
        if (data.excerpt !== undefined) { updates.push('excerpt = ?'); values.push(data.excerpt); }
        if (data.image !== undefined) { updates.push('image = ?'); values.push(data.image); }
        if (data.status) { updates.push('status = ?'); values.push(data.status); }
        if (data.author) { updates.push('author = ?'); values.push(data.author); }
        if (data.category) { updates.push('category = ?'); values.push(data.category); }
        if (data.translations) { updates.push('translations = ?'); values.push(JSON.stringify(data.translations)); }

        // Handle published_at logic
        if (data.status === 'PUBLISHED') {
            updates.push('published_at = COALESCE(published_at, NOW())');
        }

        updates.push('updated_at = NOW()');

        if (updates.length === 0) return { success: true };

        values.push(id);

        await pool.execute(
            `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        revalidatePath('/admin-portal/cms/blog');
        revalidatePath('/blog'); // Broad revalidataion
        revalidatePath('/');
        return { success: true };
    } catch (error: unknown) { // Fixed catch block typing
        console.error("Error updating blog post:", error);
        return { success: false, error: "Failed to update post" };
    }
}

export async function deleteBlogPost(id: number) {
    try {
        await pool.execute('DELETE FROM blog_posts WHERE id = ?', [id]);
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
        const [rows] = await pool.execute<BlogPost[]>(
            `SELECT * FROM blog_posts WHERE slug = ?`,
            [slug]
        );
        return rows.length > 0 ? mapPost(rows[0]) : null;
    } catch (error) {
        console.error("Error fetching blog post by slug:", error);
        return null;
    }
}

// Mapper to match Prisma shape if needed (CamelCase)
function mapPost(row: BlogPost) {
    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        content: row.content,
        excerpt: row.excerpt,
        image: row.image,
        category: row.category,
        author: row.author,
        status: row.status,
        translations: row.translations,
        publishedAt: row.published_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
