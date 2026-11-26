"use client";

import React from "react";
import type { DefaultCellComponentProps } from "payload";

/** Turn a byte count into something readable in the list view, e.g. "1.4 MB". */
export function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** exponent;
  const rounded = exponent === 0 || value >= 10 ? Math.round(value) : Number(value.toFixed(1));
  return `${rounded} ${units[exponent]}`;
}

/**
 * Renders the upload collection's built-in `filesize` field (stored in bytes)
 * with units. Payload persists list columns in user preferences, so overriding
 * the existing column is more reliable than introducing a new virtual field.
 */
export function FileSizeCell({ cellData }: DefaultCellComponentProps) {
  return <span>{formatFileSize(cellData as number | null)}</span>;
}
