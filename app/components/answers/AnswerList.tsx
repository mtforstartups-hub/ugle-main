import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { Answer, Category } from "@/payload-types";

function categoryName(category: Answer["category"] | null | undefined): string | null {
  if (category && typeof category === "object") return category.name;
  return null;
}

export function AnswerCard({
  answer,
  featured = false,
}: {
  answer: Answer;
  featured?: boolean;
}) {
  const tag = categoryName(answer.category);

  return (
    <Link
      href={`/answers/${answer.slug}`}
      className={`group flex flex-col justify-between gap-6 rounded-2xl border p-7 md:p-8 shadow-sm transition-all duration-300 hover:shadow-md ${
        featured
          ? "border-[#75C043]/40 bg-[#F8FAF9]"
          : "border-ugle-light/60 bg-white"
      }`}
    >
      <div>
        <div className="flex items-center gap-2 mb-4">
          {tag && (
            <span className="inline-block bg-[#75C043]/10 text-[#5DA233] text-[11.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              {tag}
            </span>
          )}
          {featured && (
            <span className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-ugle-gray/60">
              Featured
            </span>
          )}
        </div>
        <h2 className="text-[20px] md:text-[23px] font-bold mb-3 text-ugle-slate group-hover:text-[#5DA233] transition-colors leading-tight">
          {answer.question}
        </h2>
        <p className="text-[15.5px] text-ugle-gray leading-[1.65] line-clamp-3">
          {answer.shortAnswer}
        </p>
      </div>

      <div className="flex items-center text-[#5DA233] font-bold text-[14px] group-hover:translate-x-1 transition-transform">
        Read answer
        <ArrowRight className="w-4 h-4 ml-1.5" strokeWidth={2.5} />
      </div>
    </Link>
  );
}

export type AnswerCategory = Pick<Category, "id" | "name" | "slug">;

export function AnswerCategoryChips({
  categories,
  activeCategory,
}: {
  categories: AnswerCategory[];
  activeCategory?: string;
}) {
  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-10">
      <Link
        href="/answers"
        className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
          !activeCategory
            ? "bg-[#75C043] border-[#75C043] text-white"
            : "bg-white border-ugle-light/60 text-ugle-slate hover:border-[#75C043] hover:text-[#5DA233]"
        }`}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/answers?category=${category.slug}`}
          className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold border transition-colors ${
            activeCategory === category.slug
              ? "bg-[#75C043] border-[#75C043] text-white"
              : "bg-white border-ugle-light/60 text-ugle-slate hover:border-[#75C043] hover:text-[#5DA233]"
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}

export function AnswerPagination({
  currentPage,
  totalPages,
  category,
}: {
  currentPage: number;
  totalPages: number;
  category?: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    if (category) params.set("category", category);
    const query = params.toString();
    return query ? `/answers?${query}` : "/answers";
  };

  return (
    <nav
      aria-label="Answers pagination"
      className="flex items-center justify-center gap-1 pt-10"
    >
      {currentPage > 1 && (
        <Link
          href={hrefFor(currentPage - 1)}
          className="px-3 py-2 rounded-lg text-[13px] font-semibold text-ugle-slate hover:text-[#5DA233] transition-colors"
        >
          Previous
        </Link>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Link
          key={page}
          href={hrefFor(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`w-9 h-9 inline-flex items-center justify-center rounded-lg text-[13px] font-bold transition-all ${
            page === currentPage
              ? "bg-[#75C043] text-white shadow-sm"
              : "text-ugle-gray hover:bg-ugle-light/60 hover:text-ugle-slate"
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages && (
        <Link
          href={hrefFor(currentPage + 1)}
          className="px-3 py-2 rounded-lg text-[13px] font-semibold text-ugle-slate hover:text-[#5DA233] transition-colors"
        >
          Next
        </Link>
      )}
    </nav>
  );
}
