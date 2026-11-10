import type { CollectionConfig } from "payload";
import { slug } from "../fields/slug";
import { contentEditor } from "../lib/payload/editor";
import { revalidateAnswersPaths } from "../lib/payload/revalidate";
import { previewSecretUrl } from "../lib/payload/preview";
import { publicOrStaffRead, staffCreate, staffUpdate } from "../lib/payload/access";

export const Answers: CollectionConfig = {
  slug: "answers",
  labels: { singular: "Answer", plural: "Answers" },
  admin: {
    useAsTitle: "question",
    group: "Content",
    defaultColumns: ["question", "category", "featured", "_status", "publishedAt", "updatedAt"],
    listSearchableFields: ["question", "slug", "shortAnswer"],
    pagination: { defaultLimit: 25 },
    preview: (doc) => (doc?.slug ? previewSecretUrl("answers", String(doc.slug)) : null),
    livePreview: {
      url: ({ data }) => data?.slug ? `/answers/${data.slug}` : "/answers",
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
        if (data && !data.publishedAt) {
          data.publishedAt = new Date().toISOString();
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, previousDoc }) => {
        await revalidateAnswersPaths(doc.slug, previousDoc?.slug);
        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        await revalidateAnswersPaths((doc as { slug?: string })?.slug);
        return doc;
      },
    ],
  },
  fields: [
    { name: "question", type: "text", required: true, index: true, admin: { description: "Page H1, e.g. Does Ugle upload my recordings?" } },
    slug("question"),
    {
      name: "shortAnswer",
      type: "textarea",
      required: true,
      admin: { description: "1–2 sentence summary for cards, meta description and AI answer surfaces." },
    },
    {
      name: "answer",
      type: "richText",
      required: true,
      editor: contentEditor,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      admin: { position: "sidebar" },
    },
    {
      name: "productArea",
      type: "select",
      required: false,
      options: [
        { label: "Search", value: "search" },
        { label: "Transcription", value: "transcription" },
        { label: "Privacy", value: "privacy" },
        { label: "Pricing", value: "pricing" },
        { label: "Platforms", value: "platforms" },
        { label: "Integrations", value: "integrations" },
      ],
      admin: { position: "sidebar" },
    },
    {
      name: "keywords",
      type: "array",
      fields: [{ name: "term", type: "text", required: true }],
    },
    {
      name: "featured",
      type: "checkbox",
      required: false,
      defaultValue: false,
      admin: { position: "sidebar", description: "Shown first on /answers" },
    },
    {
      name: "order",
      type: "number",
      required: false,
      admin: { position: "sidebar", description: "Manual ordering within category/featured group" },
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
    {
      name: "relatedPosts",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      maxDepth: 0,
      required: false,
      admin: { description: "Max 3" },
    },
    {
      name: "publishedAt",
      type: "date",
      required: true,
      admin: {
        position: "sidebar",
        date: { pickerAppearance: "dayAndTime" },
      },
    },
    // meta group injected by @payloadcms/plugin-seo
  ],
};
