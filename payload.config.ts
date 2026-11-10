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
    components: {
      views: {
        dashboard: {
          Component: "/components/admin/Dashboard#Dashboard",
        },
      },
    },
    meta: { titleSuffix: "— Ugle CMS" },
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
    // Vercel Blob in production. Without a token (local dev) Payload falls
    // back to the local disk so uploads keep working.
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
            clientUploads: true,
          }),
        ]
      : []),
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
