import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  getAnswersPage,
  getAnswerCategories,
  getAnswersSettings,
  getFeaturedAnswers,
} from "@/lib/payload/queries";
import { pageMetadata, absoluteUrl, serializeJsonLd } from "@/app/lib/seo";
import BlogHero from "@/app/components/blog/BlogHero";
import GlobalCTA from "@/app/components/GlobalCTA";
import {
  AnswerCard,
  AnswerCategoryChips,
  AnswerPagination,
} from "@/app/components/answers/AnswerList";

const ANSWERS_PER_PAGE = 10;

export const revalidate = 300;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}): Promise<Metadata> {
  const { page = "1", category } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10));
  const settings = await getAnswersSettings();

  const path = category
    ? `/answers?category=${category}`
    : pageNum > 1
    ? `/answers?page=${pageNum}`
    : "/answers";

  return pageMetadata({
    title: settings?.heroTitle ?? "Answers",
    description:
      settings?.heroDescription ??
      "Direct answers about Ugle — privacy, search, transcription, pricing and platforms.",
    path,
  });
}

export default async function AnswersIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string }>;
}) {
  const { page = "1", category } = await searchParams;
  const pageNum = Math.max(1, parseInt(page, 10));

  const showFeatured = pageNum === 1 && !category;

  const [answersResult, settings, categories, featuredAnswers] = await Promise.all([
    getAnswersPage({
      page: pageNum,
      limit: ANSWERS_PER_PAGE,
      categorySlug: category,
      excludeFeatured: showFeatured,
    }),
    getAnswersSettings(),
    getAnswerCategories(),
    showFeatured ? getFeaturedAnswers(3) : Promise.resolve([]),
  ]);

  if (pageNum > answersResult.totalPages && answersResult.totalPages > 0) {
    notFound();
  }

  const visibleAnswers = [...featuredAnswers, ...answersResult.docs];

  // FAQPage JSON-LD for the visible questions on this page.
  const faqJsonLd =
    visibleAnswers.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${absoluteUrl("/answers")}#faq`,
          url: absoluteUrl("/answers"),
          mainEntity: visibleAnswers.map((answer) => ({
            "@type": "Question",
            name: answer.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: answer.shortAnswer,
            },
          })),
        }
      : null;

  const cta = settings?.cta;

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(faqJsonLd) }}
        />
      )}
      <div className="max-w-4xl mx-auto px-6 py-24">
        <BlogHero
          eyebrow={settings?.heroEyebrow ?? "Answers"}
          title={settings?.heroTitle ?? "Product questions, answered."}
          description={
            settings?.heroDescription ??
            "Direct answers about Ugle — privacy, search, transcription, pricing and platforms."
          }
        />

        <AnswerCategoryChips
          categories={categories}
          activeCategory={category}
        />

        {showFeatured && featuredAnswers.length > 0 && (
          <section className="mb-14">
            <h2 className="text-[13px] font-mono font-bold uppercase tracking-[0.14em] text-[#5DA233] mb-5">
              Featured answers
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredAnswers.map((answer) => (
                <AnswerCard key={answer.id} answer={answer} featured />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-[13px] font-mono font-bold uppercase tracking-[0.14em] text-ugle-gray/70 mb-5">
            {category ? "Answers in this category" : "All answers"}
          </h2>

          {answersResult.docs.length === 0 ? (
            <p className="text-ugle-gray">
              No answers published yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {answersResult.docs.map((answer) => (
                <AnswerCard key={answer.id} answer={answer} />
              ))}
            </div>
          )}

          <AnswerPagination
            currentPage={pageNum}
            totalPages={answersResult.totalPages}
            category={category}
          />
        </section>
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
