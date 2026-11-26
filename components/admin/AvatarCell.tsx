import React from "react";
import type { DefaultServerCellComponentProps } from "payload";
import type { Media } from "@/payload-types";

/**
 * Renders the uploaded avatar as a small round image in the Users list.
 *
 * The list view queries at `depth: 0`, so a relationship cell only receives the
 * media ID. Resolve it here rather than relying on the cell data being populated.
 */
export async function AvatarCell({ cellData, payload }: DefaultServerCellComponentProps) {
  const id =
    cellData && typeof cellData === "object"
      ? (cellData as { id?: number | string }).id
      : (cellData as number | string | undefined);

  if (!id) {
    return <span style={{ color: "#999" }}>—</span>;
  }

  const media = (await payload.findByID({
    collection: "media",
    id,
    depth: 0,
    disableErrors: true,
  })) as Media | null;

  const src = media?.sizes?.thumbnail?.url ?? media?.url ?? null;

  if (!src) {
    return <span style={{ color: "#999" }}>—</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={media?.alt ?? ""}
      width={36}
      height={36}
      style={{
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 999,
        height: 36,
        objectFit: "cover",
        width: 36,
      }}
    />
  );
}
