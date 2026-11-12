import type { MediaBlockBlock } from "@/payload-types";

import { MediaCard } from "./CtaCard";
import { mediaAlt, mediaDimensions, mediaUrl, resolveMedia } from "../media";

const sizeClasses = {
  full: "w-full",
  large: "mx-auto w-full md:w-[85%]",
  medium: "mx-auto w-full md:w-[65%]",
} as const;

const alignClasses = {
  left: "mr-auto",
  center: "mx-auto",
  right: "ml-auto",
} as const;

export function MediaBlock({ block }: { block: MediaBlockBlock }) {
  const media = resolveMedia(block.image);
  const src = mediaUrl(media, "hero") ?? mediaUrl(media);
  if (!src) return null;

  const { width, height } = mediaDimensions(media, "hero");
  const size = block.size ?? "full";
  const alignment = block.alignment ?? "center";

  return (
    <MediaCard
      src={src}
      alt={mediaAlt(media, block.caption ?? "")}
      width={width}
      height={height}
      caption={block.caption}
      sizes="(max-width: 768px) 100vw, 800px"
      className={`${sizeClasses[size]} ${alignClasses[alignment]}`}
    />
  );
}
