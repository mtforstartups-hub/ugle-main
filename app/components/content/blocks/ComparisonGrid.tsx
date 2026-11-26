import type { ComparisonGridBlock } from "@/payload-types";

export function ComparisonGrid({ block }: { block: ComparisonGridBlock }) {
  return (
    <div className="not-prose my-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="rounded-xl border border-ugle-light/60 bg-[#F7F7F5] p-5">
        <span className="mb-2 block font-mono text-[12px] font-bold uppercase tracking-wider text-ugle-gray">
          {block.leftLabel}
        </span>
        <p className="m-0 text-[17px] font-bold text-ugle-slate">{block.leftValue}</p>
      </div>
      <div className="rounded-xl border border-[#75C043]/30 bg-[#F0F4EE] p-5">
        <span className="mb-2 block font-mono text-[12px] font-bold uppercase tracking-wider text-[#5DA233]">
          {block.rightLabel}
        </span>
        <p className="m-0 text-[17px] font-bold text-ugle-slate">{block.rightValue}</p>
      </div>
    </div>
  );
}
