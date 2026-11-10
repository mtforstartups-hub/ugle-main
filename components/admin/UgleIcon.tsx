import React from "react";

/** Replaces Payload's nav mark with the Ugle icon in the admin header. */
export function UgleIcon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/ugle-icon.png"
      alt="Ugle"
      width={18}
      height={18}
      style={{ display: "block", height: "100%", objectFit: "contain", width: "100%" }}
    />
  );
}
