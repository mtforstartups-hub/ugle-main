"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";

interface BlogPostItem {
  path: string;
  slug: string;
  title: string;
  desc: string;
  meta: string;
  tag: string;
  image: string;
}

interface BlogListProps {
  items: BlogPostItem[];
  currentPage: number;
  totalPages: number;
  category?: string;
}

const POSTS_PER_PAGE = 5;

export default function BlogList({ items, currentPage, totalPages, category }: BlogListProps) {
  const [page, setPage] = useState(currentPage);

  function goTo(next: number) {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col gap-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-8"
        >
          {items.map((post, i) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: i * 0.06,
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
        </motion.div>
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-ugle-light/60">
          {/* Prev */}
          <button
            onClick={() => goTo(page - 1)}
            disabled={page === 1}
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ugle-slate hover:text-[#5DA233] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
            Previous
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goTo(p)}
                className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${
                  p === page
                    ? "bg-[#75C043] text-white shadow-sm"
                    : "text-ugle-gray hover:bg-ugle-light/60 hover:text-ugle-slate"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => goTo(page + 1)}
            disabled={page === totalPages}
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-ugle-slate hover:text-[#5DA233] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
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