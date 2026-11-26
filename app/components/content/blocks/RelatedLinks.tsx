import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { RelatedLinksBlock } from "@/payload-types";

export function RelatedLinks({ block }: { block: RelatedLinksBlock }) {
  return (
    <div className="not-prose my-10">
      <p className="mb-3 font-mono text-[13px] uppercase tracking-[0.14em] text-[#5DA233]">
        Related
      </p>
      <div className="divide-y divide-ugle-light/60 overflow-hidden rounded-xl border border-ugle-light/60">
        {block.links.map((link, index) => (
          <Link
            key={link.id ?? index}
            href={link.href}
            className="group flex items-center justify-between gap-4 bg-white p-4 no-underline transition-colors hover:bg-[#F7F7F5]"
          >
            <span>
              <span className="block text-[16px] font-semibold text-ugle-slate group-hover:text-[#5DA233]">
                {link.label}
              </span>
              {link.description ? (
                <span className="mt-0.5 block text-[14px] text-ugle-gray">
                  {link.description}
                </span>
              ) : null}
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#75C043]" />
          </Link>
        ))}
      </div>
    </div>
  );
}
