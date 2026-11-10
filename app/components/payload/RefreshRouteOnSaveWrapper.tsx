"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

interface RefreshRouteOnSaveWrapperProps {
  serverURL?: string;
}

/**
 * `RefreshRouteOnSave` calls `refresh()` once on mount (to pick up the latest
 * draft data after announcing itself to the admin). A full `window.location.reload()`
 * there re-mounts the component, which calls `refresh()` again — an infinite
 * reload loop. `router.refresh()` re-fetches the RSC payload in place, so the
 * component keeps its identity and the effect does not re-run.
 */
export function RefreshRouteOnSaveWrapper({ serverURL }: RefreshRouteOnSaveWrapperProps) {
  const router = useRouter();

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  // Prefer the configured origin, but fall back to the origin we are actually
  // served from so preview deployments and localhost still match the admin's
  // postMessage origin.
  const resolvedServerURL =
    serverURL || (typeof window !== "undefined" ? window.location.origin : "");

  return <RefreshRouteOnSave serverURL={resolvedServerURL} refresh={refresh} />;
}
