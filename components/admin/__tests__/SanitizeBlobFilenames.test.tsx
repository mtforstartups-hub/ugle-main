import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { SanitizeBlobFilenames } from "../SanitizeBlobFilenames";

// The provider only touches the upload handler registry in an effect, which does
// not run during server rendering, so a stub is enough.
vi.mock("@payloadcms/ui", () => ({
  useUploadHandlers: () => ({
    getUploadHandler: () => undefined,
    setUploadHandler: () => undefined,
  }),
}));

describe("SanitizeBlobFilenames", () => {
  // Payload renders config providers around the whole admin UI, passing the
  // admin tree as `children`. Returning null here blanked every admin screen.
  it("renders the admin UI it wraps", () => {
    const html = renderToStaticMarkup(
      <SanitizeBlobFilenames collectionSlug={"media" as never}>
        <span>admin content</span>
      </SanitizeBlobFilenames>
    );

    expect(html).toContain("admin content");
  });
});
