import type { EmbedBlock } from "@/payload-types";

const aspectClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-[4/3]",
  "1:1": "aspect-square",
} as const;

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = parsed.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (host === "vimeo.com") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id ? `https://player.vimeo.com/video/${id}` : null;
    }
  } catch {
    return null;
  }
  return null;
}

export function Embed({ block }: { block: EmbedBlock }) {
  const embedUrl = toEmbedUrl(block.url);

  return (
    <div className="not-prose my-8">
      <div
        className={`overflow-hidden rounded-[14px] border border-ugle-light/60 bg-[#F7F7F5] shadow-sm ${
          aspectClasses[block.aspectRatio ?? "16:9"]
        }`}
      >
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={block.title ?? "Embedded media"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-center">
            <a
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#5DA233] hover:underline"
            >
              {block.title ?? block.url}
            </a>
          </div>
        )}
      </div>
      {block.caption ? (
        <p className="mt-3 text-center text-[14px] text-ugle-gray">{block.caption}</p>
      ) : null}
    </div>
  );
}
