import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

import { ChipGrid } from "../blocks/ChipGrid";
import { ComparisonGrid } from "../blocks/ComparisonGrid";
import { CtaCard } from "../blocks/CtaCard";
import { DataTable } from "../blocks/DataTable";
import { Embed } from "../blocks/Embed";
import { MediaBlock } from "../blocks/MediaBlock";
import { Note } from "../blocks/Note";
import { QueryBox } from "../blocks/QueryBox";
import { RelatedLinks } from "../blocks/RelatedLinks";
import { StatCard } from "../blocks/StatCard";
import { StepList } from "../blocks/StepList";

const render = (element: React.ReactElement) => renderToStaticMarkup(element);

describe("rich-text block components", () => {
  it("renders a chip grid", () => {
    const html = render(
      <ChipGrid
        block={
          { title: "Platforms", items: [{ text: "macOS" }, { text: "Windows" }] } as never
        }
      />
    );

    expect(html).toContain("Platforms");
    expect(html).toContain("macOS");
    expect(html).toContain("Windows");
  });

  it("renders a comparison grid", () => {
    const html = render(
      <ComparisonGrid
        block={
          {
            leftLabel: "Cloud",
            leftValue: "Uploads everything",
            rightLabel: "Ugle",
            rightValue: "Stays on device",
          } as never
        }
      />
    );

    expect(html).toContain("Cloud");
    expect(html).toContain("Stays on device");
  });

  it("renders a CTA card with a button", () => {
    const html = render(
      <CtaCard
        block={
          {
            eyebrow: "Try it",
            title: "Start searching",
            body: "15 days free",
            buttonLabel: "Get started",
            buttonHref: "/download",
            variant: "green",
          } as never
        }
      />
    );

    expect(html).toContain("Start searching");
    expect(html).toContain("Get started");
    expect(html).toContain('href="/download"');
  });

  it("renders a data table", () => {
    const html = render(
      <DataTable
        block={
          {
            columns: [{ header: "Feature" }, { header: "Ugle" }],
            rows: [{ cells: [{ value: "Search" }, { value: "Yes" }] }],
            caption: "Comparison",
          } as never
        }
      />
    );

    expect(html).toContain("<table");
    expect(html).toContain("Feature");
    expect(html).toContain("Comparison");
  });

  it("normalises YouTube and Vimeo embeds", () => {
    const youtube = render(
      <Embed block={{ url: "https://www.youtube.com/watch?v=abc123" } as never} />
    );
    const vimeo = render(
      <Embed block={{ url: "https://vimeo.com/12345", aspectRatio: "4:3" } as never} />
    );

    expect(youtube).toContain("https://www.youtube.com/embed/abc123");
    expect(vimeo).toContain("https://player.vimeo.com/video/12345");
    expect(vimeo).toContain("aspect-[4/3]");
  });

  it("renders a media block from populated media", () => {
    const html = render(
      <MediaBlock
        block={
          {
            image: {
              url: "https://cdn.example.com/hero.jpg",
              alt: "Hero",
              width: 1600,
              height: 900,
            },
            caption: "A caption",
            size: "medium",
            alignment: "center",
          } as never
        }
      />
    );

    expect(html).toContain("https://cdn.example.com/hero.jpg");
    expect(html).toContain("A caption");
  });

  it("renders nothing for a media block without an image", () => {
    expect(render(<MediaBlock block={{ image: 12 } as never} />)).toBe("");
  });

  it("renders a note", () => {
    const html = render(<Note block={{ body: "Heads up", variant: "amber" } as never} />);
    expect(html).toContain("Heads up");
    expect(html).toContain("bg-[#FDF6E7]");
  });

  it("renders a query box", () => {
    const html = render(
      <QueryBox
        block={{ label: "Try this", query: "budget", description: "Find quotes" } as never}
      />
    );

    expect(html).toContain("Try this");
    expect(html).toContain("budget");
  });

  it("renders related links", () => {
    const html = render(
      <RelatedLinks
        block={
          {
            links: [
              { label: "Pricing", href: "/pricing", description: "Plans" },
            ],
          } as never
        }
      />
    );

    expect(html).toContain("Pricing");
    expect(html).toContain('href="/pricing"');
  });

  it("renders stat cards in both themes", () => {
    const light = render(
      <StatCard block={{ value: "95%", label: "Accuracy", description: "Measured" } as never} />
    );
    const dark = render(
      <StatCard block={{ value: "10x", label: "Faster", theme: "dark" } as never} />
    );

    expect(light).toContain("95%");
    expect(dark).toContain("bg-[#1C1C1C]");
  });

  it("renders a step list with numbering", () => {
    const html = render(
      <StepList
        block={
          {
            steps: [
              { title: "Upload", description: "Add a file" },
              { title: "Search", description: "Find a quote" },
            ],
          } as never
        }
      />
    );

    expect(html).toContain("Upload");
    expect(html).toContain(">1<");
    expect(html).toContain(">2<");
  });
});
