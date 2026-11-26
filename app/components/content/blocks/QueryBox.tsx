import type { QueryBoxBlock } from "@/payload-types";

export function QueryBox({ block }: { block: QueryBoxBlock }) {
  return (
    <div className="not-prose my-6 rounded-xl border border-[#75C043]/30 bg-[#F0F4EE] p-5">
      <span className="mb-1 block font-mono text-[12px] font-bold uppercase tracking-wider text-[#5DA233]">
        {block.label}
      </span>
      <p className="m-0 text-[18px] font-bold text-ugle-slate">
        &ldquo;{block.query}&rdquo;
      </p>
      {block.description ? (
        <p className="mt-2 text-[14px] text-ugle-gray">{block.description}</p>
      ) : null}
    </div>
  );
}
