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

  return <HomeClient reviews={reviews} posts={posts} />;
}
