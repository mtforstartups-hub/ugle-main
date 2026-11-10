import type { CollectionConfig } from "payload";
import { slug } from "../fields/slug";
import { contentEditor } from "../lib/payload/editor";
import { estimateReadingTime } from "../lib/payload/reading-time";
import { revalidateBlogPaths } from "../lib/payload/revalidate";
import { previewSecretPath, previewSecretUrl } from "../lib/payload/preview";
import { publicOrStaffRead, staffCreate, staffUpdate } from "../lib/payload/access";

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "Post", plural: "Posts" },
  admin: {
    useAsTitle: "title",
    group: "Content",
    defaultColumns: ["title", "category", "author", "_status", "publishedAt", "updatedAt"],
    listSearchableFields: ["title", "slug", "excerpt"],
    pagination: { defaultLimit: 25 },
    preview: (doc) => (doc?.slug ? previewSecretUrl("posts", String(doc.slug)) : null),
    livePreview: {
      url: ({ data }) => previewSecretPath("posts", data?.slug),
    },
  },
  defaultSort: "-publishedAt",
  versions: {
    drafts: { autosave: true, schedulePublish: true },
    maxPerDoc: 50,
  },
  trash: true,
  access: {
    read: publicOrStaffRead,
    create: staffCreate,
    update: staffUpdate,
    delete: ({ req: { user } }) => Boolean(user?.role === "admin" || user),
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data) {
          if (data.content) {
            (data as Record<string, unknown>).readingTime = estimateReadingTime(data.content);
          }
          if (!data.publishedAt) {
            data.publishedAt = new Date().toISOString();
          }
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc }) => {
        // Payload creates an empty draft the first time the create view
        // renders. Calling revalidatePath during that render is unsupported
        // in Next.js, and an empty draft has no public paths to refresh.
        if (!doc.slug && !previousDoc?.slug) return doc;
        await revalidateBlogPaths(doc.slug, previousDoc?.slug);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await revalidateBlogPaths((doc as { slug?: string })?.slug);
        return doc;
      },
    ],
  },
  fields: [
    { name: "title", type: "text", required: true, index: true, admin: { description: "Post title" } },
    slug("title"),
    {
      name: "excerpt",
      type: "textarea",
      required: true,
      maxLength: 300,
      admin: { description: "Used on cards and as fallback meta description. Max ~300 chars." },
    },
    {
      name: "heroImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { description: "1600×900 recommended" },
    },
    {
      name: "content",
      type: "richText",
      required: true,
      editor: contentEditor,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      admin: { position: "sidebar", description: "Single category" },
    },
    {
      name: "author",
      type: "relationship",
      relationTo: "authors",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
        description: "Publication date. Defaults to now on first publish.",
      },
    },
    {
      name: "readingTime",
      type: "number",
      required: false,
      admin: { position: "sidebar", description: "Minutes. Auto-computed from content." },
      defaultValue: 1,
    },
    {
      name: "featured",
      type: "checkbox",
      required: false,
      defaultValue: false,
      admin: { position: "sidebar", description: "Controls homepage / featured placement" },
    },
    {
      name: "relatedPosts",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      required: false,
      admin: {
        description: "Max 3. Only the posts you pick here appear in the Related posts section.",
      },
    },
    {
      name: "relatedAnswers",
      type: "relationship",
      relationTo: "answers",
      hasMany: true,
      maxDepth: 0,
      required: false,
      admin: { description: "Max 3" },
    },
    // meta group injected by @payloadcms/plugin-seo
  ],
};
