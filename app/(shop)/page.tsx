import { getFeaturedReviews } from "@/app/actions/reviews";
import { getBlogPosts } from "@/app/actions/blog";
import HomeClient from "./HomeClient";

// Ensure this page is revalidated regularly
export const revalidate = 3600; // 1 hour

export default async function Home() {
  const [reviews, posts] = await Promise.all([
    getFeaturedReviews(6),
    getBlogPosts(3)
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
    category: p.category || "General"
  }));

  return <HomeClient reviews={formattedReviews} posts={formattedPosts} />;
}
