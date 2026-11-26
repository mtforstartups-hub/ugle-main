import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { BlogListItem } from "@/lib/payload/blog-list";

interface FeaturedPostsProps {
  posts: BlogListItem[];
}

/**
 * Editor's picks sit on their own tinted shelf above the feed: equal-width
 * cards, up to four across on wide screens. Same card anatomy as the feed —
 * image above, text below, never overlaid — so the shelf reads as a curated
 * subset rather than a different component.
 */
export default function FeaturedPosts({ posts }: FeaturedPostsProps) {
  if (posts.length === 0) return null;

  // Cards keep the same anatomy at every count; only the track count changes,
  // so one or two picks never stretch into oversized cards.
  const layout =
    posts.length >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : posts.length === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : posts.length === 2
          ? "max-w-3xl sm:grid-cols-2"
          : "max-w-md";

  return (
    <section
      aria-labelledby="featured-posts-heading"
      className="mb-12 rounded-3xl border border-ugle-light/80 bg-[#F7F9F6] p-5 md:mb-14 md:p-8"
    >
      <h2
        id="featured-posts-heading"
        className="mb-5 font-mono text-[12px] font-bold uppercase tracking-[0.16em] text-[#5DA233] md:mb-6"
      >
        Editor&apos;s picks
      </h2>

      <div className={`grid grid-cols-1 gap-4 md:gap-5 ${layout}`}>
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={post.path}
            className="group flex h-full flex-col overflow-hidden rounded-xl border border-ugle-light/80 bg-white transition-colors duration-300 hover:border-[#75C043]/60"
          >
            <div className="relative aspect-16/10 w-full overflow-hidden bg-[#EDF1EA]">
              {post.image ? (
                <Image
                  src={post.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-[#EDF1EA]" />
              )}
            </div>

            <div className="flex flex-1 flex-col p-4">
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#5DA233]">
                {post.tag}
              </span>

              <h3 className="mt-2 line-clamp-2 text-[16.5px] font-bold leading-[1.3] text-ugle-slate transition-colors group-hover:text-[#5DA233]">
                {post.title}
              </h3>

              {post.desc && (
                <p className="mt-2 line-clamp-2 text-[14px] leading-[1.55] text-ugle-gray">
                  {post.desc}
                </p>
              )}

              <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                <span className="inline-flex items-center gap-1 text-[13px] font-bold text-[#5DA233]">
                  Read post
                  <ArrowRight
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    strokeWidth={2.5}
                  />
                </span>
                <span className="font-mono text-[11px] text-ugle-gray/60">
                  {post.meta}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
