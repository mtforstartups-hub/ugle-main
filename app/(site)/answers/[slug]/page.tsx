import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { draftMode } from "next/headers";

import {
  getAllAnswerSlugs,
  getAnswerBySlug,
  getAnswersSettings,
  getRelatedAnswers,
  getRelatedPostsForAnswer,
} from "@/lib/payload/queries";
import { pageMetadata, SITE_URL, absoluteUrl, serializeJsonLd } from "@/app/lib/seo";
import { PostContent } from "@/app/components/blog/PostContent";
import GlobalCTA from "@/app/components/GlobalCTA";
import BreadcrumbJsonLd from "@/app/components/Seo/BreadcrumbJsonLd";
import { AnswerCard } from "@/app/components/answers/AnswerList";
import { RefreshRouteOnSaveWrapper } from "@/app/components/payload/RefreshRouteOnSaveWrapper";

export async function generateStaticParams() {
  const slugs = await getAllAnswerSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const answer = await getAnswerBySlug(slug);

  if (!answer) {
    return {
      title: "Answer Not Found",
      description: "The requested answer could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const metaImageMedia =
    answer.meta?.image && typeof answer.meta.image === "object"
      ? answer.meta.image
      : null;
  const metaImage = metaImageMedia?.url
    ? {
        url: metaImageMedia.url,
        alt: answer.meta?.title ?? answer.question,
        width: metaImageMedia.width ?? 1200,
        height: metaImageMedia.height ?? 630,
      }
    : undefined;

  return pageMetadata({
    title: answer.meta?.title ?? answer.question,
    description: answer.meta?.description ?? answer.shortAnswer,
    path: `/answers/${slug}`,
    ogType: "article",
    socialImage: metaImage,
  });
}

export default async function AnswerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const answer = await getAnswerBySlug(slug);

  if (!answer) notFound();

  const [settings, relatedAnswers, relatedPosts] = await Promise.all([
    getAnswersSettings(),
    getRelatedAnswers(answer),
    getRelatedPostsForAnswer(answer),
  ]);

  const breadcrumbs = [
    { name: "Home", href: SITE_URL },
    { name: "Answers", href: `${SITE_URL}/answers` },
    { name: answer.question, href: `${SITE_URL}/answers/${slug}` },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${absoluteUrl(`/answers/${slug}`)}#faq`,
    url: absoluteUrl(`/answers/${slug}`),
    mainEntity: [
      {
        "@type": "Question",
        name: answer.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: answer.shortAnswer,
        },
      },
    ],
  };

  const cta = settings?.cta;
  const category =
    answer.category && typeof answer.category === "object" ? answer.category : null;

  // Check if we're in draft mode for live preview banner
  const dm = await draftMode();
  const isPreview = dm.isEnabled;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
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
        <nav aria-label="Breadcrumb" className="mb-10">
          <ol className="flex flex-wrap items-center gap-2 text-[13px] font-mono text-ugle-gray/70">
            <li>
              <Link href="/" className="hover:text-[#5DA233] transition-colors">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/answers"
                className="hover:text-[#5DA233] transition-colors"
              >
                Answers
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-ugle-slate line-clamp-1">{answer.question}</li>
          </ol>
        </nav>

        <article>
          <header className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              {category && (
                <span className="inline-block bg-[#75C043]/10 text-[#5DA233] text-[11.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                  {category.name}
                </span>
              )}
              <time
                dateTime={answer.publishedAt}
                className="text-[13px] font-mono text-ugle-gray/70"
              >
                {new Date(answer.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <h1 className="text-[34px] md:text-[44px] font-extrabold tracking-[-0.02em] mb-6 text-ugle-slate leading-[1.1]">
              {answer.question}
            </h1>
            <p className="text-[19px] md:text-[21px] text-ugle-gray leading-[1.55] border-l-[3px] border-[#75C043] pl-5">
              {answer.shortAnswer}
            </p>
          </header>

          <div className="prose prose-lg max-w-none text-[#3A3A3A] prose-p:leading-[1.65] prose-headings:text-[#3A3A3A] prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#5DA233] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline prose-strong:text-[#3A3A3A] prose-blockquote:border-l-[3px] prose-blockquote:border-[#75C043] prose-blockquote:bg-[#F7F7F5] prose-blockquote:py-3 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:rounded-r-lg prose-blockquote:text-[#3A3A3A] prose-blockquote:font-medium prose-blockquote:text-[20px]">
            <PostContent content={answer.answer} />
          </div>
        </article>

        {relatedAnswers.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[22px] font-bold text-ugle-slate mb-8">
              Related answers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedAnswers.map((related) => (
                <AnswerCard key={related.id} answer={related} />
              ))}
            </div>
          </section>
        )}

        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-[22px] font-bold text-ugle-slate mb-8">
              Related posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-ugle-light/60 p-6 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <h3 className="text-[18px] font-bold text-ugle-slate group-hover:text-[#5DA233] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[15px] text-ugle-gray line-clamp-2">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <section className="w-full border-t border-ugle-light/60 bg-[#F8FAF9] py-16 md:py-20">
        <GlobalCTA
          title={cta?.title ?? "Take control of your media."}
          subtitle={cta?.body ?? "Get 15 days trial and see for yourself."}
          ctaText={cta?.buttonLabel ?? undefined}
          ctaLink={cta?.buttonHref ?? undefined}
        />
      </section>
    </>
  );
}
