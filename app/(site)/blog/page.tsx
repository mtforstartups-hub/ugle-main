import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostsPage, getBlogSettings } from "@/lib/payload/queries";
import { mapPostToListItem } from "@/lib/payload/blog-list";
import BlogHero from "@/app/components/blog/BlogHero";
import BlogList from "@/app/components/blog/BlogList";
import GlobalCTA from "@/app/components/GlobalCTA";
import { pageMetadata } from "@/app/lib/seo";

const POSTS_PER_PAGE = 5;

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

  const [postsResult, settings] = await Promise.all([
    getPostsPage({ page: pageNum, limit: POSTS_PER_PAGE, categorySlug: category }),
    getBlogSettings(),
  ]);

  if (pageNum > postsResult.totalPages && postsResult.totalPages > 0) {
    notFound();
  }

  // Convert posts to the format BlogList expects
  const blogItems = postsResult.docs.map(mapPostToListItem);

  return (
    <>
      <div className="max-w-4xl mx-auto px-6 py-24">
        <BlogHero
          eyebrow={settings?.heroEyebrow ?? "Blog"}
          title={settings?.heroTitle ?? "Thoughts & Workflow."}
          description={settings?.heroDescription ?? "Product thinking. Workflow observations. Opinions on how media professionals work."}
        />

        <BlogList
          items={blogItems}
          currentPage={pageNum}
          totalPages={postsResult.totalPages}
          category={category}
        />
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