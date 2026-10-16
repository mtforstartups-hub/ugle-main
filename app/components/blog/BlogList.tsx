"use client";

import { useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import Link from "next/link";

const POSTS_PER_PAGE = 5;

const blogItems = [
  {
    path: "/blog/why-local-first",
    slug: "why-local-first",
    title: "Why we built Ugle local-first",
    desc: "The first version of what became Ugle uploaded files to a server. We built it that way because it was easier — existing transcription APIs, no on-device model to maintain, faster to ship...",
    meta: "4 min read",
    tag: "Product philosophy",
    image: "/images/blogs/why-local-first.jpg",
  },
  {
    path: "/blog/cost-of-scrubbing-timelines",
    slug: "cost-of-scrubbing-timelines",
    title: "The real cost of scrubbing timelines",
    desc: "A documentary editor we spoke to last year spends six to ten hours a week scrubbing through footage to find moments she already knows exist. She has watched most of it once...",
    meta: "3 min read",
    tag: "Workflow",
    image: "/images/blogs/cost-of-scrubbing.jpg",
  },
  {
    path: "/blog/languages-supported",
    slug: "languages-supported",
    title: "The 90+ Languages Supported by Ugle",
    desc: "A search tool is only as useful as the language it can index. From the start, we designed Ugle's local-first engine to recognize more than just English — over 90 languages, entirely on-device.",
    meta: "4 min read",
    tag: "Product",
    image: "/images/blogs/languages-supported.png",
  },
  {
    path: "/blog/what-transcription-accuracy-means",
    slug: "what-transcription-accuracy-means",
    title: "What 95% transcription accuracy actually means",
    desc: "We say 95% accuracy. That number is word error rate measured against manually transcribed ground truth across languages, accents, recording conditions, and speaker types...",
    meta: "5 min read",
    tag: "Product",
    image: "/images/blogs/transcription-accuracy.jpg",
  },
  {
    path: "/blog/find-quote-in-video-without-exact-words",
    slug: "find-quote-in-video-without-exact-words",
    title: "How to Find a Quote in a Video Without the Exact Words",
    desc: "Remember what someone said but not the exact wording or timestamp? Learn how semantic media search helps you find the right moment inside video recordings.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/find-quote-in-video.png",
  },
  {
    path: "/blog/search-across-multiple-audio-recordings",
    slug: "search-across-multiple-audio-recordings",
    title: "How to Search Across Multiple Audio Recordings",
    desc: "Learn how to search spoken content across multiple audio recordings from one place instead of opening files and transcripts individually.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/search-across-multiple-audio-recordings.png",
  },
  {
    path: "/blog/search-podcast-back-catalogue",
    slug: "search-podcast-back-catalogue",
    title: "How to Search a Podcast Back Catalogue for Past Guest Answers",
    desc: "Search across years of podcast recordings to find past guest answers, themes and soundbites without listening through old episodes again.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/search-podcast-back-catalogue.png",
  },
  {
    path: "/blog/search-journalist-interview-recordings-locally",
    slug: "search-journalist-interview-recordings-locally",
    title: "How Journalists Can Search Interview Recordings Locally",
    desc: "Learn how journalists can create a searchable local archive of interview recordings while keeping media, transcripts and search activity on their own machine.",
    meta: "5 min read",
    tag: "Journalism",
    image: "/images/blogs/search-journalist-interview-recordings-locally.png",
  },
  {
    path: "/blog/keyword-search-vs-semantic-search-recorded-interviews",
    slug: "keyword-search-vs-semantic-search-recorded-interviews",
    title: "Keyword Search vs Semantic Search for Recorded Interviews",
    desc: "Understand the difference between keyword and semantic search when looking for quotes, topics and Moments inside recorded interviews.",
    meta: "4 min read",
    tag: "Product",
    image: "/images/blogs/keyword-search-vs-semantic-search.png",
  },
  {
    path: "/blog/find-archive-soundbite-news-segment",
    slug: "find-archive-soundbite-news-segment",
    title: "How to Find an Archive Soundbite for a News Segment",
    desc: "Need an old interview clip before deadline? Learn a faster workflow for searching newsroom recordings by topic and returning to the exact source moment.",
    meta: "4 min read",
    tag: "Newsrooms",
    image: "/images/blogs/find-archive-soundbite-news-segment.jpg",
  },
  {
    path: "/blog/local-vs-cloud-media-search",
    slug: "local-vs-cloud-media-search",
    title: "Local vs Cloud Media Search: What to Compare Before Choosing",
    desc: "Compare local and cloud media search across privacy, hardware, access, collaboration, indexing and ongoing connectivity before choosing a workflow.",
    meta: "5 min read",
    tag: "Product philosophy",
    image: "/images/blogs/local-vs-cloud-media-search.png",
  },
  {
    path: "/blog/build-searchable-interview-archive",
    slug: "build-searchable-interview-archive",
    title: "How to Build a Searchable Interview Archive",
    desc: "Turn a growing folder of interview recordings into a searchable archive that lets you retrieve topics, quotes and source Moments later.",
    meta: "5 min read",
    tag: "Workflow",
    image: "/images/blogs/build-searchable-interview-archive.jpg",
  },
  {
    path: "/blog/verify-quote-against-original-recording",
    slug: "verify-quote-against-original-recording",
    title: "How to Verify a Quote Against the Original Recording",
    desc: "Found a quote in a transcript or media search result? Learn why source playback, timestamp verification and context checks still matter.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/verify-quote-against-original-recording.png",
  },
  {
    path: "/blog/transcription-search-quality-recorded-media",
    slug: "transcription-search-quality-recorded-media",
    title: "What Affects Transcription and Search Quality in Recorded Media?",
    desc: "Audio quality, accents, languages, overlapping speakers and terminology can all affect transcription and media search. Here is what to understand before relying on results.",
    meta: "5 min read",
    tag: "Product",
    image: "/images/blogs/transcription-search-quality-recorded-media.jpg",
  },
  {
    path: "/blog/evaluate-media-search-software",
    slug: "evaluate-media-search-software",
    title: "How to Evaluate Media Search Software With Your Own Recordings",
    desc: "A practical test for comparing media search tools using real interviews, difficult queries, source verification, privacy and archive workflows.",
    meta: "6 min read",
    tag: "Comparison",
    image: "/images/blogs/evaluate-media-search-software.jpg",
  },
  {
    path: "/blog/retrieved-interview-passage-to-clip",
    slug: "retrieved-interview-passage-to-clip",
    title: "How to Turn a Retrieved Interview Passage Into a Reusable Clip",
    desc: "Find an interview passage, verify it in context, define the useful section and move it into your editing workflow as a reusable clip.",
    meta: "4 min read",
    tag: "Workflow",
    image: "/images/blogs/retrieved-interview-passage-to-clip.jpg",
  },
];

export default function BlogList() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(blogItems.length / POSTS_PER_PAGE);
  const start = (page - 1) * POSTS_PER_PAGE;
  const pagePosts = blogItems.slice(start, start + POSTS_PER_PAGE);

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
          {pagePosts.map((post, i) => (
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
          {blogItems.map((item) => (
            <li key={item.slug}>
              <Link href={item.path}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
