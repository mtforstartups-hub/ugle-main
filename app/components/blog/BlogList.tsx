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
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-8">
        {items.map((post, i) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (i % 5) * 0.06,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Link
              href={post.path}
              className="group flex flex-col md:flex-row gap-0 rounded-2xl border border-ugle-light/60 overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Image panel */}
              <div className="relative w-full md:w-[42%] shrink-0 aspect-video md:aspect-auto overflow-hidden bg-[#F0F2F0]">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
                {/* subtle gradient overlay at image bottom on mobile */}
                <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-white/20 to-transparent md:hidden" />
              </div>

              {/* Text panel */}
              <div className="flex flex-col justify-between p-7 md:p-9 flex-1">
                <div>
                  {/* Tag + reading time */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block bg-[#75C043]/10 text-[#5DA233] text-[11.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {post.tag}
                    </span>
                    <span className="text-[13px] font-mono text-ugle-gray/70">
                      {post.meta}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-[22px] md:text-[26px] font-bold mb-3 text-ugle-slate group-hover:text-[#5DA233] transition-colors leading-tight">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-[15.5px] text-ugle-gray leading-[1.65] line-clamp-3">
                    {post.desc}
                  </p>
                </div>

                {/* Read more */}
                <div className="flex items-center text-[#5DA233] font-bold text-[14px] mt-6 group-hover:translate-x-1 transition-transform">
                  Read post{" "}
                  <ArrowRight className="w-4 h-4 ml-1.5" strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex flex-col items-center gap-3 pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#75C043] px-8 py-3 text-[15px] font-bold text-white shadow-sm transition-colors hover:bg-[#5DA233] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />}
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
        <p className="pt-2 text-center text-[13px] font-mono text-ugle-gray/60">
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
