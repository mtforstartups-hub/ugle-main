import path from "path";
import { fileURLToPath } from "url";
import { buildConfig } from "payload";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import sharp from "sharp";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Categories } from "./collections/Categories";
import { Authors } from "./collections/Authors";
import { Posts } from "./collections/Posts";
import { Answers } from "./collections/Answers";
import { BlogSettings } from "./globals/BlogSettings";
import { AnswersSettings } from "./globals/AnswersSettings";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    avatar: {
      Component: "/components/admin/UserAvatar#UserAvatar",
    },
    components: {
      providers: [
        // Renames uploads to URL-safe filenames before Vercel Blob signs the
        // client upload token (see components/admin/SanitizeBlobFilenames.tsx).
        {
          path: "/components/admin/SanitizeBlobFilenames#SanitizeBlobFilenames",
          clientProps: { collectionSlug: "media" },
        },
      ],
      graphics: {
        Icon: "/components/admin/UgleIcon#UgleIcon",
        Logo: "/components/admin/UgleLogo#UgleLogo",
      },
      views: {
        dashboard: {
          Component: "/components/admin/Dashboard#Dashboard",
        },
      },
    },
    // Keep the admin branded as Ugle. Payload's defaults otherwise advertise
    // the framework in the page title, favicon and Open Graph metadata.
    meta: {
      titleSuffix: "— Ugle CMS",
      description: "Ugle CMS — the content workspace for ugle.ai.",
      defaultOGImageType: "off",
      icons: { icon: "/ugle-icon.png" },
      openGraph: {
        title: "Ugle CMS",
        siteName: "Ugle CMS",
        description: "Ugle CMS — the content workspace for ugle.ai.",
        images: [{ url: "/ugle-icon.png", width: 512, height: 512, alt: "Ugle" }],
      },
      twitter: {
        card: "summary",
        title: "Ugle CMS",
        description: "Ugle CMS — the content workspace for ugle.ai.",
      },
    },
    livePreview: {
      breakpoints: [
        { label: "Mobile", name: "mobile", width: 375, height: 667 },
        { label: "Tablet", name: "tablet", width: 768, height: 1024 },
        { label: "Desktop", name: "desktop", width: 1440, height: 900 },
      ],
    },
  },
  editor: lexicalEditor(),
  collections: [Users, Media, Categories, Authors, Posts, Answers],
  globals: [BlogSettings, AnswersSettings],
  // Drop the last framework-branded string from the admin UI (the account
  // preferences heading).
  i18n: {
    translations: {
      en: {
        general: {
          payloadSettings: "Preferences",
        },
      },
    },
  },
  secret: process.env.PAYLOAD_SECRET || "",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL,
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || ""].filter(Boolean),
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || ""].filter(Boolean),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || "" },
    push: process.env.NODE_ENV !== "production",
  }),
  sharp,
  typescript: { outputFile: path.resolve(dirname, "payload-types.ts") },
  plugins: [
    // Vercel Blob in production. Without a token (local dev) the plugin is
    // disabled and Payload keeps files on the local disk, but `alwaysInsertFields`
    // keeps its hidden fields (`_objectKey`, `prefix`) in the schema so the
    // database shape is identical in every environment. Without it, the schema
    // only matches production and the build fails on a missing `_objectkey`
    // column.
    vercelBlobStorage({
      // Serve media straight from the Blob CDN. The default (`false`) routes
      // every file through `/api/media/file/...`, i.e. a Vercel Function that
      // fetches the blob and streams it back: slow, uncached at the edge, and
      // it also produces absolute same-origin URLs that `next/image` rejects
      // unless the deployment origin is whitelisted. Media is public content,
      // so Payload's file access control adds nothing here.
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
      clientUploads: true,
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      alwaysInsertFields: true,
    }),
    seoPlugin({
      collections: ["posts", "answers"],
      uploadsCollection: "media",
      generateTitle: ({ doc }) => `${(doc as { title?: string; question?: string }).title ?? (doc as { question?: string }).question} — Ugle`,
      generateDescription: ({ doc }) => ((doc as { excerpt?: string; shortAnswer?: string }).excerpt ?? (doc as { shortAnswer?: string }).shortAnswer ?? "") as string,
    }),
    // Optional until the proxy-side redirect handler is implemented (see §8.7).
    redirectsPlugin({ collections: ["posts", "answers"] }),
  ],
  jobs: {
    access: {
      run: ({ req }) => {
        if (req.user) return true;
        const secret = process.env.CRON_SECRET;
        return Boolean(secret) && req.headers.get("authorization") === `Bearer ${secret}`;
      },
    },
    tasks: [],
  },
});
