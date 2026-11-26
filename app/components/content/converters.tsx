import Link from "next/link";
import Image from "next/image";
import type { DefaultNodeTypes, SerializedBlockNode } from "@payloadcms/richtext-lexical";
import type { JSXConvertersFunction } from "@payloadcms/richtext-lexical/react";

import type {
  ChipGridBlock,
  ComparisonGridBlock,
  CtaCardBlock,
  DataTableBlock,
  EmbedBlock,
  MediaBlockBlock,
  NoteBlock,
  QueryBoxBlock,
  RelatedLinksBlock,
  StatCardBlock,
  StepListBlock,
} from "@/payload-types";

import { CtaCard } from "./blocks/CtaCard";
import { Note } from "./blocks/Note";
import { QueryBox } from "./blocks/QueryBox";
import { StepList } from "./blocks/StepList";
import { ComparisonGrid } from "./blocks/ComparisonGrid";
import { StatCard } from "./blocks/StatCard";
import { ChipGrid } from "./blocks/ChipGrid";
import { DataTable } from "./blocks/DataTable";
import { MediaBlock } from "./blocks/MediaBlock";
import { Embed } from "./blocks/Embed";
import { RelatedLinks } from "./blocks/RelatedLinks";
import { mediaAlt, mediaDimensions, mediaUrl, resolveMedia, type MediaLike } from "./media";

type ContentBlock =
  | CtaCardBlock
  | NoteBlock
  | QueryBoxBlock
  | StepListBlock
  | ComparisonGridBlock
  | StatCardBlock
  | ChipGridBlock
  | DataTableBlock
  | MediaBlockBlock
  | EmbedBlock
  | RelatedLinksBlock;

type NodeTypes = DefaultNodeTypes | SerializedBlockNode<ContentBlock>;

function isExternalHref(href: string) {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || href.startsWith("mailto:");
}

export const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  link: ({ node, nodesToJSX }) => {
    const relation = node.fields?.doc as
      | { relationTo?: string; value?: { slug?: string } | number }
      | undefined;
    const relationSlug =
      relation?.value && typeof relation.value === "object" ? relation.value.slug : undefined;
    const href = node.fields?.url ?? relationSlug ?? "#";
    const children = nodesToJSX({ nodes: node.children });
    const newTab = node.fields?.newTab;

    if (isExternalHref(href)) {
      return (
        <a
          href={href}
          className="font-semibold text-[#5DA233] no-underline hover:underline"
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className="font-semibold text-[#5DA233] no-underline hover:underline">
        {children}
      </Link>
    );
  },
  upload: ({ node }) => {
    const media = resolveMedia(node.value as unknown as MediaLike);
    const src = mediaUrl(media, "hero") ?? mediaUrl(media);
    if (!src) return null;

    const { width, height } = mediaDimensions(media, "hero");

    return (
      <figure className="not-prose my-8">
        <div className="overflow-hidden rounded-[14px] border border-ugle-light/60 shadow-sm">
          <Image
            src={src}
            alt={mediaAlt(media)}
            width={width}
            height={height}
            sizes="(max-width: 768px) 100vw, 800px"
            className="h-auto w-full"
          />
        </div>
        {media?.caption ? (
          <figcaption className="mt-3 text-center text-[14px] text-ugle-gray">
            {media.caption}
          </figcaption>
        ) : null}
      </figure>
    );
  },
  blocks: {
    ctaCard: ({ node }) => <CtaCard block={node.fields} />,
    note: ({ node }) => <Note block={node.fields} />,
    queryBox: ({ node }) => <QueryBox block={node.fields} />,
    stepList: ({ node }) => <StepList block={node.fields} />,
    comparisonGrid: ({ node }) => <ComparisonGrid block={node.fields} />,
    statCard: ({ node }) => <StatCard block={node.fields} />,
    chipGrid: ({ node }) => <ChipGrid block={node.fields} />,
    dataTable: ({ node }) => <DataTable block={node.fields} />,
    mediaBlock: ({ node }) => <MediaBlock block={node.fields} />,
    embed: ({ node }) => <Embed block={node.fields} />,
    relatedLinks: ({ node }) => <RelatedLinks block={node.fields} />,
  },
});
