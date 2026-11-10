import type { CollectionConfig } from "payload";
import { revalidateMediaPaths } from "../lib/payload/revalidate";

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
