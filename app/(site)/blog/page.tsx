import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPostsPage,
  getBlogSettings,
  getFeaturedPosts,
  DEFAULT_POSTS_PER_PAGE,
} from "@/lib/payload/queries";
import { mapPostToListItem } from "@/lib/payload/blog-list";
import BlogHero from "@/app/components/blog/BlogHero";
import BlogList from "@/app/components/blog/BlogList";
import FeaturedPosts from "@/app/components/blog/FeaturedPosts";
import GlobalCTA from "@/app/components/GlobalCTA";
import { pageMetadata } from "@/app/lib/seo";

const MAX_FEATURED_POSTS = 4;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getBlogSettings();
  return pageMetadata({
    title: settings?.heroTitle ?? "Blog",
    description: settings?.heroDescription ?? "Insights, philosophy, and technical deep-dives into local-first audio search, on-device AI transcription, and privacy-first media workflows.",
    path: "/blog",
  });
}

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page = "1", category } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10));

  // Featured posts get their own band on the first page. They are excluded
  // from the feed on every unfiltered page so they never appear twice; a
  // category listing ignores the flag and shows them in place.
  const showFeatured = pageNum === 1 && !category;

  const [postsResult, settings, featuredPosts] = await Promise.all([
    getPostsPage({
      page: pageNum,
      limit: DEFAULT_POSTS_PER_PAGE,
      categorySlug: category,
      excludeFeatured: !category,
    }),
    getBlogSettings(),
    showFeatured ? getFeaturedPosts(MAX_FEATURED_POSTS) : Promise.resolve([]),
  ]);

  if (pageNum > postsResult.totalPages && postsResult.totalPages > 0) {
    notFound();
  }

  // Convert posts to the format BlogList expects
  const blogItems = postsResult.docs.map(mapPostToListItem);
  const featuredItems = featuredPosts.map(mapPostToListItem);

  return (
    <>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <BlogHero
          eyebrow={settings?.heroEyebrow ?? "Blog"}
          title={settings?.heroTitle ?? "Thoughts & Workflow."}
          description={settings?.heroDescription ?? "Product thinking. Workflow observations. Opinions on how media professionals work."}
        />

        {showFeatured && featuredItems.length > 0 && (
          <FeaturedPosts posts={featuredItems} />
        )}

        <section>
          <h2 className="mb-5 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-ugle-gray/70">
            {category ? "Posts in this category" : "Latest posts"}
          </h2>

          <BlogList
            items={blogItems}
            currentPage={pageNum}
            totalPages={postsResult.totalPages}
            category={category}
          />
        </section>
      </div>
      <section className="w-full border-t border-ugle-light/60 bg-[#F8FAF9] py-16 md:py-20">
        <GlobalCTA
          title="Take control of your media."
          subtitle="Get 15 days trial and see for yourself."
        />
      </section>
    </>
  );
}