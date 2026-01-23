import { getFeaturedReviews } from "@/app/actions/reviews";
import { getFeaturedCategories } from "@/app/actions/categories";
import { getBlogPosts } from "@/app/actions/blog";
import HomeClient from "./HomeClient";

// Ensure this page is revalidated regularly
export const revalidate = 3600; // 1 hour

export default async function Home() {
  const [reviews, posts, categories] = await Promise.all([
    getFeaturedReviews(6),
    getBlogPosts(3),
    getFeaturedCategories()
  ]);

  const formattedReviews = reviews.map(r => ({
    id: r.id,
    name: r.patient.firstName ? `${r.patient.firstName} ${r.patient.lastName || ''}`.trim() : 'Verified Customer',
    rating: r.rating,
    comment: r.comment || "",
    avatar: r.patient.avatar || undefined
  }));

  const formattedPosts = posts.map(p => ({
    title: p.title,
    excerpt: p.excerpt || "",
    image: p.image || "/images/placeholder.jpg",
    date: new Date(p.publishedAt || p.createdAt).toLocaleDateString(),
    slug: p.slug,
    readTime: `${Math.ceil((p.content.split(' ').length || 0) / 200)} min read`,
    category: p.category || "General",
    translations: p.translations
  }));

  return <HomeClient reviews={formattedReviews} posts={formattedPosts} categories={categories} />;
}
