import React from "react";

/**
 * Replaces Payload's wordmark on the admin login screen so the CMS reads as
 * Ugle's own. The PNG is dark artwork, so it is inverted in the dark theme.
 */
export function UgleLogo() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/Ugle Logo.png"
        alt="Ugle"
        width={244}
        height={88}
        className="ugle-admin-logo"
        style={{ height: 56, width: "auto" }}
      />
      <style>{`[data-theme="dark"] .ugle-admin-logo{filter:brightness(0) invert(1)}`}</style>
    </>
  );
}
