import type { StatCardBlock } from "@/payload-types";

export function StatCard({ block }: { block: StatCardBlock }) {
  const dark = (block.theme ?? "default") === "dark";

  if (dark) {
    return (
      <div className="not-prose my-10 flex flex-col items-center gap-6 rounded-2xl bg-[#1C1C1C] p-8 text-white shadow-lg sm:flex-row md:p-10">
        <div className="shrink-0 text-center sm:text-left">
          <p className="m-0 text-[52px] font-extrabold leading-none tracking-tight text-[#75C043]">
            {block.value}
          </p>
          <p className="mb-0 mt-1 font-mono text-[14px] uppercase tracking-widest text-white/60">
            {block.label}
          </p>
        </div>
        {block.description ? (
          <>
            <div className="hidden w-px self-stretch bg-white/10 sm:block" />
            <p className="m-0 text-[17px] font-light leading-relaxed text-white/80">
              {block.description}
            </p>
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className="not-prose my-8 rounded-xl border border-ugle-light/60 bg-[#F7F7F5] p-6">
      <p className="m-0 text-[40px] font-extrabold leading-none tracking-tight text-[#5DA233]">
        {block.value}
      </p>
      <p className="mb-0 mt-1 font-mono text-[13px] uppercase tracking-widest text-ugle-gray">
        {block.label}
      </p>
      {block.description ? (
        <p className="mt-3 text-[15px] text-ugle-gray">{block.description}</p>
      ) : null}
    </div>
  );
}
