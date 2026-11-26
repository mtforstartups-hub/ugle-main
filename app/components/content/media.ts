import type { Media } from "@/payload-types";

export type MediaLike = Media | number | null | undefined;

export function resolveMedia(value: MediaLike): Media | null {
  if (!value || typeof value === "number") return null;
  return value;
}

export function mediaUrl(media: Media | null, size?: "thumbnail" | "card" | "hero" | "og") {
  if (!media) return null;
  const sized = size ? media.sizes?.[size] : undefined;
  return sized?.url ?? media.url ?? null;
}

export function mediaAlt(media: Media | null, fallback = "") {
  return media?.alt || fallback;
}

export function mediaDimensions(
  media: Media | null,
  size?: "thumbnail" | "card" | "hero" | "og",
) {
  const sized = size ? media?.sizes?.[size] : undefined;
  return {
    width: sized?.width ?? media?.width ?? 1600,
    height: sized?.height ?? media?.height ?? 900,
  };
}
