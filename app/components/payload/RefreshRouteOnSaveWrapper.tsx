"use client";

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useCallback } from "react";

interface RefreshRouteOnSaveWrapperProps {
  serverURL?: string;
}

export function RefreshRouteOnSaveWrapper({ serverURL }: RefreshRouteOnSaveWrapperProps) {
  const refresh = useCallback(() => {
    window.location.reload();
  }, []);

  return <RefreshRouteOnSave serverURL={serverURL || "http://localhost:3000"} refresh={refresh} />;
}