import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";
import { getAllPostSlugs, getPostBySlug, getBlogSettings, getRelatedPosts } from "@/lib/payload/queries";
import BlogHero from "@/app/components/blog/BlogHero";
import GlobalCTA from "@/app/components/GlobalCTA";
import { PostContent } from "@/app/components/blog/PostContent";
import { pageMetadata } from "@/app/lib/seo";
import Image from "next/image";
import BreadcrumbJsonLd from "@/app/components/Seo/BreadcrumbJsonLd";
import { RefreshRouteOnSaveWrapper } from "@/app/components/payload/RefreshRouteOnSaveWrapper";
import {
  SITE_URL,
  absoluteUrl,
  serializeJsonLd,
} from "@/app/lib/seo";

const POSTS_PER_PAGE = 5;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
      description: "The requested blog article could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const settings = await getBlogSettings();
  const heroMedia = post.heroImage && typeof post.heroImage === "object" ? post.heroImage : null;
  const metaImageMedia = post.meta?.image && typeof post.meta.image === "object" ? post.meta.image : null;
  const metaImage = metaImageMedia?.url
    ? { url: metaImageMedia.url, alt: post.meta?.title ?? post.title, width: metaImageMedia.width ?? 1200, height: metaImageMedia.height ?? 630 }
    : heroMedia?.url
    ? { url: heroMedia.url, alt: post.title, width: heroMedia.width ?? 1200, height: heroMedia.height ?? 630 }
    : undefined;

  return pageMetadata({
    title: post.meta?.title ?? post.title,
    description: post.meta?.description ?? post.excerpt,
    path: `/blog/${slug}`,
    ogType: "article",
    socialImage: metaImage,
  });
}

export default async function page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const [settings, relatedPosts] = await Promise.all([
    getBlogSettings(),
    getRelatedPosts(post),
  ]);

  // Build breadcrumbs for BreadcrumbJsonLd
  const breadcrumbs = [
    { name: "Home", href: SITE_URL },
    { name: "Blog", href: `${SITE_URL}/blog` },
    { name: post.title, href: `${SITE_URL}/blog/${slug}` },
  ];

  // Resolve hero image (can be number or populated Media)
  const heroMedia = post.heroImage && typeof post.heroImage === "object" ? post.heroImage : null;

  // Build BlogPosting JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: heroMedia?.url ? absoluteUrl(heroMedia.url) : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: post.author && typeof post.author === "object"
      ? {
          "@type": "Person",
          name: post.author.name,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "Ugle",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/ugle-icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/blog/${slug}`,
    },
  };

  // Check if we're in draft mode for live preview banner
  const dm = await draftMode();
  const isPreview = dm.isEnabled;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      {isPreview && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            background: "#75C043",
            color: "#1C1C1C",
            padding: "8px 16px",
            textAlign: "center",
            fontWeight: 700,
            fontSize: 13,
            zIndex: 9999,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          🔍 Live Preview Mode — Changes refresh automatically.{" "}
          <a
            href="/api/exit-preview"
            style={{ color: "#1C1C1C", textDecoration: "underline", marginLeft: 12 }}
          >
            Exit preview
          </a>
        </div>
      )}
      {isPreview && <RefreshRouteOnSaveWrapper serverURL={process.env.NEXT_PUBLIC_SERVER_URL} />}
      <div className="max-w-4xl mx-auto px-6 py-24" style={{ paddingTop: isPreview ? "80px" : "6rem" }}>
        <BlogHero
          eyebrow={settings?.heroEyebrow ?? "Blog"}
          title={settings?.heroTitle ?? "Thoughts & Workflow."}
          description={settings?.heroDescription ?? "Product thinking. Workflow observations. Opinions on how media professionals work."}
        />

        <article className="prose prose-lg max-w-none text-[#3A3A3A] prose-p:leading-[1.65] prose-headings:text-[#3A3A3A] prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#5DA233] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-[#3A3A3A] prose-blockquote:border-l-[3px] prose-blockquote:border-[#75C043] prose-blockquote:bg-[#F7F7F5] prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg prose-blockquote:text-[#3A3A3A] prose-blockquote:font-medium prose-blockquote:text-[20px]">
          <header className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              {post.category && typeof post.category === "object" && (
                <span className="inline-block bg-[#75C043]/10 text-[#5DA233] text-[11.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {post.category.name}
                </span>
              )}
              <time
                dateTime={post.publishedAt}
                className="text-[13px] font-mono text-ugle-gray/70"
              >
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <h1 className="text-[36px] md:text-[46px] font-extrabold tracking-[-0.02em] mb-10 text-ugle-slate leading-[1.1]">
              {post.title}
            </h1>
          </header>

          {heroMedia?.url && (
            <figure className="not-prose my-14">
              <div className="relative w-full rounded-2xl overflow-hidden border border-ugle-light/60 shadow-sm aspect-video bg-[#F0F2F0]">
                <Image
                  src={heroMedia.url}
                  alt={post.title}
                  fill
                  className="object-cover object-top"
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            </figure>
          )}

          <div className="prose prose-lg max-w-none">
            <PostContent content={post.content} />
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[22px] font-bold text-ugle-slate mb-8">Related posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.slice(0, 2).map((related) => (
                <a
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-ugle-light/60 p-6 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-[18px] font-bold text-ugle-slate group-hover:text-[#5DA233] transition-colors">
                    {related.title}
                  </h3>
                  <p className="text-[15px] text-ugle-gray line-clamp-2">{related.excerpt}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="w-full border-t border-ugle-light/60 bg-[#F8FAF9] py-16 md:py-20 mt-16">
          <GlobalCTA
            title="Take control of your media."
            subtitle="Get 15 days trial and see for yourself."
          />
        </section>
      </div>
    </>
  );
}