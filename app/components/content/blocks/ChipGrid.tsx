import type { ChipGridBlock } from "@/payload-types";

export function ChipGrid({ block }: { block: ChipGridBlock }) {
  return (
    <div className="not-prose my-8">
      {block.title ? (
        <p className="mb-3 font-mono text-[13px] uppercase tracking-[0.14em] text-[#5DA233]">
          {block.title}
        </p>
      ) : null}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {block.items.map((item, index) => (
          <span
            key={item.id ?? index}
            className="rounded-lg border border-ugle-light/60 bg-white px-3 py-2 text-center text-[14px] text-ugle-slate"
          >
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
