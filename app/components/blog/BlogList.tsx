"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { loadMorePosts } from "@/app/actions/blog";
import type { BlogListItem } from "@/lib/payload/blog-list";

interface BlogListProps {
  items: BlogListItem[];
  currentPage: number;
  totalPages: number;
  category?: string;
}

/**
 * The first two posts of the first page form a 60/40 lead row. Everything
 * after that — the rest of the page and every "Load more" batch — is a 50/50
 * grid, so the rhythm never breaks mid-row.
 */
const LEAD_COUNT = 2;

type CardVariant = "lead" | "narrow" | "standard";

export default function BlogList({
  items: initialItems,
  currentPage,
  totalPages: initialTotalPages,
  category,
}: BlogListProps) {
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(currentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hasMore = page < totalPages;
  const showLead = currentPage === 1;
  const lead = showLead ? items.slice(0, LEAD_COUNT) : [];
  const rest = showLead ? items.slice(LEAD_COUNT) : items;

  function loadMore() {
    if (isPending || !hasMore) return;
    setError(null);
    startTransition(async () => {
      try {
        const next = await loadMorePosts({ page: page + 1, category });
        setItems((prev) => [...prev, ...next.items]);
        setPage(next.page);
        setTotalPages(next.totalPages);
      } catch {
        setError("Couldn't load more posts. Please try again.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-ugle-light bg-white/60 px-6 py-16 text-center text-ugle-gray">
          No posts published yet. Check back soon.
        </p>
      ) : (
        <>
          {lead.length > 0 && (
            <div
              className={`grid gap-5 md:gap-6 ${
                lead.length === 2 ? "md:grid-cols-[3fr_2fr]" : ""
              }`}
            >
              {lead.map((post, i) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  index={i}
                  variant={i === 0 ? "lead" : "narrow"}
                />
              ))}
            </div>
          )}

          {rest.length > 0 && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
              {rest.map((post, i) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  index={i + lead.length}
                  variant="standard"
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#75C043] px-8 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#5DA233] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending && (
              <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
            )}
            {isPending ? "Loading…" : "Load more posts"}
          </button>
          {error && (
            <p role="alert" className="text-[13px] font-medium text-red-600">
              {error}
            </p>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center font-mono text-[12px] text-ugle-gray/60">
          You&apos;ve reached the end.
        </p>
      )}

      {/* Crawler-accessible static links for all articles so search engines discover every post */}
      <nav aria-label="All Articles" className="sr-only">
        <h2>All Articles</h2>
        <ul>
          {items.map((item) => (
            <li key={item.slug}>
              <Link href={item.path}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

const imageAspect: Record<CardVariant, string> = {
  // The narrow lead card gets a taller crop so both lead images end on the
  // same line and the two text blocks start at the same height.
  lead: "aspect-[16/9]",
  narrow: "aspect-[16/9] md:aspect-[6/5]",
  standard: "aspect-[16/10]",
};

const imageSizes: Record<CardVariant, string> = {
  lead: "(max-width: 768px) 100vw, 60vw",
  narrow: "(max-width: 768px) 100vw, 40vw",
  standard: "(max-width: 768px) 100vw, 50vw",
};

const titleSize: Record<CardVariant, string> = {
  lead: "text-[24px] md:text-[30px]",
  narrow: "text-[21px] md:text-[23px]",
  standard: "text-[19px] md:text-[21px]",
};

function PostCard({
  post,
  variant,
  index,
}: {
  post: BlogListItem;
  variant: CardVariant;
  index: number;
}) {
  const isLead = variant !== "standard";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: Math.min(index, 5) * 0.04,
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="h-full"
    >
      <Link
        href={post.path}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ugle-light bg-[#F7F9F6] transition-colors duration-300 hover:border-[#75C043]/60"
      >
        <div
          className={`relative w-full overflow-hidden bg-[#F1F4EF] ${imageAspect[variant]}`}
        >
          {post.image ? (
            <Image
              src={post.image}
              alt=""
              fill
              sizes={imageSizes[variant]}
              priority={index === 0}
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="absolute inset-0 bg-[#EDF1EA]" />
          )}
        </div>

        <div
          className={`flex flex-1 flex-col ${isLead ? "p-6 md:p-7" : "p-5 md:p-6"}`}
        >
          <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5DA233]">
            {post.tag}
          </span>

          <h2
            className={`mt-2 font-bold leading-[1.2] text-ugle-slate transition-colors group-hover:text-[#5DA233] ${
              titleSize[variant]
            }`}
          >
            <span className="line-clamp-2">{post.title}</span>
          </h2>

          {post.desc && (
            <p
              className={`mt-2.5 text-ugle-gray ${
                isLead
                  ? "line-clamp-3 text-[15.5px] leading-[1.65]"
                  : "line-clamp-2 text-[15px] leading-[1.6]"
              }`}
            >
              {post.desc}
            </p>
          )}

          <div className="mt-auto flex items-center justify-between gap-4 pt-5">
            <span className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#5DA233]">
              Read post
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </span>
            <span className="font-mono text-[11.5px] text-ugle-gray/60">
              {post.meta}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
