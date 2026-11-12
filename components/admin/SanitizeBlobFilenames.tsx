"use client";

import { Fragment, useEffect } from "react";
import { useUploadHandlers } from "@payloadcms/ui";
import type { UploadCollectionSlug } from "payload";

import { sanitizeFilename } from "@/lib/media/filename";

type UploadHandler = (args: {
  docPrefix?: string;
  file: File;
  updateFilename: (filename: string) => void;
}) => Promise<unknown>;

// Handlers we already wrapped, so re-mounts and re-renders never double-wrap.
const wrappedHandlers = new WeakSet<UploadHandler>();

/**
 * Vercel Blob client uploads use the raw browser file name as the object key
 * and sign it into the upload token. Names with spaces (or other characters
 * the SDK has to encode) make the signed pathname and the uploaded pathname
 * disagree, and Vercel answers with a 400 that the browser reports as a CORS
 * error. Rename the file to a URL-safe name before the storage plugin's
 * handler runs, so any file an editor picks uploads cleanly.
 *
 * This is registered as an admin provider, which Payload wraps around the whole
 * admin UI, so it must render `children` — returning null blanks every screen.
 */
export function SanitizeBlobFilenames({
  children,
  collectionSlug,
}: {
  children?: React.ReactNode;
  collectionSlug: UploadCollectionSlug;
}) {
  const { getUploadHandler, setUploadHandler } = useUploadHandlers();

  useEffect(() => {
    // The storage plugin registers its handler from its own effect. Defer so
    // this wrapper always wraps that handler, whatever order providers mount.
    const timer = setTimeout(() => {
      const existing = getUploadHandler({ collectionSlug });
      if (!existing || wrappedHandlers.has(existing)) return;

      const handler: UploadHandler = (args) => {
        const name = sanitizeFilename(args.file.name, args.file.type);
        const file =
          name === args.file.name
            ? args.file
            : new File([args.file], name, {
                lastModified: args.file.lastModified,
                type: args.file.type,
              });

        return existing({ ...args, file });
      };

      wrappedHandlers.add(handler);
      setUploadHandler({ collectionSlug, handler });
    }, 0);

    return () => clearTimeout(timer);
  }, [collectionSlug, getUploadHandler, setUploadHandler]);

  return <Fragment>{children}</Fragment>;
}
