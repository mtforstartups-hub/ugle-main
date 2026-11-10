import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { CtaCardBlock } from "@/payload-types";

const cardVariants = {
  dark: "bg-[#3A3A3A] text-white",
  light: "bg-white text-ugle-slate border border-ugle-light/60",
  green: "bg-[#F0F4EE] text-ugle-slate border border-[#75C043]/30",
} as const;

const buttonVariants = {
  dark: "bg-white text-[#3A3A3A] hover:bg-[#F0F4EE]",
  light: "bg-[#75C043] text-white hover:bg-[#5DA233]",
  green: "bg-[#75C043] text-white hover:bg-[#5DA233]",
} as const;

export function CtaCard({ block }: { block: CtaCardBlock }) {
  const variant = block.variant ?? "dark";
  const dark = variant === "dark";

  return (
    <div
      className={`not-prose my-14 rounded-2xl p-8 text-center shadow-lg md:p-10 ${cardVariants[variant]}`}
    >
      {block.eyebrow ? (
        <p
          className={`mb-2 font-mono text-[12px] uppercase tracking-[0.14em] ${
            dark ? "text-white/60" : "text-[#5DA233]"
          }`}
        >
          {block.eyebrow}
        </p>
      ) : null}
      <h3
        className={`mb-2 mt-0 border-0 text-[22px] font-bold ${
          dark ? "text-white" : "text-ugle-slate"
        }`}
      >
        {block.title}
      </h3>
      {block.body ? (
        <p
          className={`mx-auto mb-6! max-w-md text-[17px] ${
            dark ? "text-[#c3c5cd]" : "text-ugle-gray"
          }`}
        >
          {block.body}
        </p>
      ) : null}
      {block.buttonLabel && block.buttonHref ? (
        <Link
          href={block.buttonHref}
          className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-[15px] font-semibold no-underline transition-colors ${buttonVariants[variant]}`}
        >
          {block.buttonLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function MediaCard({
  src,
  alt,
  width,
  height,
  caption,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string | null;
  className?: string;
  sizes?: string;
}) {
  return (
    <figure className={`not-prose my-8 ${className ?? ""}`}>
      <div className="overflow-hidden rounded-[14px] border border-ugle-light/60 shadow-sm">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className="h-auto w-full"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 text-center text-[14px] text-ugle-gray">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
