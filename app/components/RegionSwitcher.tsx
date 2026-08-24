"use client";

import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Globe, ChevronDown } from "lucide-react";
import { REGION_COOKIE, ALL_REGIONS, type Region } from "../lib/priceConfig";

const REGION_OPTIONS: { value: Region; label: string }[] = [
  { value: "US", label: "United States" },
  { value: "GB", label: "United Kingdom" },
  { value: "EU", label: "Europe" },
  { value: "IN", label: "India" },
];

/** Read the ugle_region cookie value on the client. */
function readCookieRegion(): Region | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${REGION_COOKIE}=([^;]+)`),
  );
  const val = match?.[1];
  return val && (ALL_REGIONS as string[]).includes(val)
    ? (val as Region)
    : null;
}

export default function RegionSwitcher({
  currentRegion,
}: {
  currentRegion?: Region;
}) {
  const router = useRouter();

  // useSyncExternalStore is the React-idiomatic way to read a browser-only
  // value (cookie) without useEffect + setState:
  //   getServerSnapshot → used on the server + initial hydration (no mismatch)
  //   getSnapshot       → reads the cookie on the client after hydration
  // No cascading renders, no effects, no lint warnings.
  const region = useSyncExternalStore(
    () => () => {}, // cookies have no push-based subscription; no-op is fine
    () => readCookieRegion() ?? currentRegion ?? "US", // client
    () => currentRegion ?? "US", // server / hydration
  );

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as Region;
    document.cookie = `${REGION_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24}; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors relative group justify-center sm:justify-end">
      <Globe className="size-4 text-[#75C043]" />
      <select
        id="region-currency-switcher"
        value={region}
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
