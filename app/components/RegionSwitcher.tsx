"use client";

import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { REGION_COOKIE, type Region } from "../lib/priceConfig";

const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "EU", label: "Europe" },
  { value: "IN", label: "India" },
];

export default function RegionSwitcher({
  currentRegion,
}: {
  currentRegion?: Region;
}) {
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const region = e.target.value as Region;
    // Write cookie client-side (httpOnly: false in proxy.ts)
    document.cookie = `${REGION_COOKIE}=${region}; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
    // Re-run the server component so the new price config is picked up
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative group justify-center sm:justify-end">
      <Globe className="w-4 h-4 text-[#75C043]" />
      <select
        id="region-currency-switcher"
        value={currentRegion ?? "US"}
        onChange={handleChange}
        className="bg-transparent border-none outline-none cursor-pointer appearance-none font-mono text-xs focus:outline-none uppercase tracking-wider pr-6 z-10 relative"
      >
        {REGION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-ugle-slate">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
