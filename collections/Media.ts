import { APIError } from "payload";
import type { CollectionConfig } from "payload";
import { sanitizeFilename } from "../lib/media/filename";
import { revalidateMediaPaths } from "../lib/payload/revalidate";

/**
 * Payload 3 does not expose a per-collection upload size limit, so enforce it
 * in a hook. Vercel's server-side upload limit is 4.5 MB; client uploads
 * bypass it, but a hard ceiling stops multi-gigabyte files from entering the
 * CMS (and the blob store) by accident.
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    group: "Media",
    defaultColumns: ["filename", "alt", "mimeType", "filesize", "updatedAt"],
    components: {},
  },
  upload: {
    imageSizes: [
      { name: "thumbnail", width: 480, height: 270 },
      { name: "card", width: 960, height: 540 },
      { name: "hero", width: 1600, height: 900 },
      { name: "og", width: 1200, height: 630 },
    ],
    mimeTypes: ["image/*"],
    focalPoint: true,
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user?.role === "admin" || user),
  },
  hooks: {
    beforeOperation: [
      ({ req }) => {
        // Client uploads rename the file in the browser; this covers server-side
        // uploads (local disk in dev, bulk uploads, API calls) so object keys and
        // filenames are always URL-safe.
        if (req.file?.name) {
          req.file.name = sanitizeFilename(req.file.name, req.file.mimetype);
        }
      },
    ],
    beforeValidate: [
      ({ data }) => {
        const filesize = (data as { filesize?: number } | undefined)?.filesize;
        if (typeof filesize === "number" && filesize > MAX_FILE_SIZE) {
          throw new APIError("Images must be 10 MB or smaller.", 400);
        }
        return data;
      },
    ],
    afterChange: [
      () => {
        revalidateMediaPaths();
      },
    ],
    afterDelete: [
      () => {
        revalidateMediaPaths();
      },
    ],
  },
  fields: [
    {
      // Merged into the upload collection's built-in `filesize` field so the
      // list view shows a readable size instead of raw bytes.
      name: "filesize",
      type: "number",
      label: "File Size",
      admin: {
        components: {
          Cell: "/components/admin/FileSizeCell#FileSizeCell",
        },
      },
    },
    {
      name: "alt",
      type: "text",
      required: true,
      label: "Alt text",
      admin: { description: "Required for accessibility and SEO." },
      validate: (val: null | string | undefined) =>
        !val || val.length >= 3 || "Alt text must be at least 3 characters",
    },
    {
      name: "caption",
      type: "text",
      required: false,
    },
    {
      name: "credit",
      type: "text",
      required: false,
    },
  ],
};
