"use client";

import React from "react";
import { useAuth } from "@payloadcms/ui";

type MediaLike = {
  alt?: string | null;
  url?: string | null;
  sizes?: Record<string, { url?: string | null } | undefined> | null;
};

function resolveAvatarUrl(avatar: unknown): string | null {
  if (!avatar || typeof avatar !== "object") return null;
  const media = avatar as MediaLike;
  return media.sizes?.thumbnail?.url ?? media.url ?? null;
}

/**
 * Admin header avatar. Payload's default is a Gravatar keyed off the email, but
 * editors upload a real avatar in the Users collection, so prefer that and
 * fall back to the user's initial when none is set.
 */
export function UserAvatar() {
  const { user } = useAuth();
  const src = resolveAvatarUrl((user as { avatar?: unknown } | null)?.avatar);

  if (!src) {
    const initial = (user?.name || user?.email || "U").slice(0, 1).toUpperCase();
    return (
      <span
        aria-hidden="true"
        style={{
          alignItems: "center",
          background: "#E7F5DA",
          borderRadius: 999,
          color: "#3F7A1B",
          display: "inline-flex",
          fontSize: 13,
          fontWeight: 700,
          height: 30,
          justifyContent: "center",
          width: 30,
        }}
      >
        {initial}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={user?.name ?? "User avatar"}
      width={30}
      height={30}
      style={{
        border: "1px solid rgba(0, 0, 0, 0.08)",
        borderRadius: 999,
        height: 30,
        objectFit: "cover",
        width: 30,
      }}
    />
  );
}
