import type { StepListBlock } from "@/payload-types";

export function StepList({ block }: { block: StepListBlock }) {
  return (
    <div className="not-prose my-8 space-y-4 rounded-xl bg-[#F7F7F5] p-6">
      {block.steps.map((step, index) => (
        <div key={step.id ?? index} className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#75C043] text-sm font-bold text-white">
            {index + 1}
          </span>
          <div>
            <p className="m-0 text-[16px] font-semibold text-ugle-slate">
              {step.title}
            </p>
            {step.description ? (
              <p className="m-0 mt-1 text-[15px] text-ugle-gray">{step.description}</p>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
