import { RefreshRouteOnSaveWrapper } from "./RefreshRouteOnSaveWrapper";

/**
 * Editorial overlay rendered only when Next.js draft mode is enabled.
 *
 * - Shows the "Live Preview Mode" banner with an exit link.
 * - Keeps the page in sync with the Payload admin (refresh on save).
 * - Hides the public cookie-consent UI, which would otherwise cover the draft
 *   page inside the admin's live-preview iframe.
 */
export function PreviewOverlay() {
  return (
    <>
      <style>{`[data-cookie-ui]{display:none!important}`}</style>
      <div
        style={{
          background: "#75C043",
          color: "#1C1C1C",
          padding: "8px 16px",
          textAlign: "center",
          fontWeight: 700,
          fontSize: 13,
          zIndex: 9999,
        }}
      >
        🔍 Live Preview Mode — Changes refresh automatically.{" "}
        <a
          href="/api/exit-preview"
          style={{ color: "#1C1C1C", textDecoration: "underline", marginLeft: 12 }}
        >
          Exit preview
        </a>
      </div>
      <RefreshRouteOnSaveWrapper serverURL={process.env.NEXT_PUBLIC_SERVER_URL} />
    </>
  );
}
