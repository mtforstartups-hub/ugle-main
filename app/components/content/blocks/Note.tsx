import type { NoteBlock } from "@/payload-types";

const noteVariants = {
  gray: "bg-[#F7F7F5] border-ugle-light/60 text-ugle-slate",
  green: "bg-[#F0F4EE] border-[#75C043]/30 text-ugle-slate",
  amber: "bg-[#FDF6E7] border-[#E9B949]/40 text-[#6B4E16]",
} as const;

export function Note({ block }: { block: NoteBlock }) {
  return (
    <div
      className={`not-prose my-8 rounded-xl border p-6 text-[16px] leading-[1.6] ${
        noteVariants[block.variant ?? "gray"]
      }`}
    >
      <p className="m-0">{block.body}</p>
    </div>
  );
}
