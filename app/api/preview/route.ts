import { draftMode } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { previewUrl } from "@/lib/payload/preview";

const COLLECTIONS = ["posts", "answers"] as const;
type PreviewCollection = (typeof COLLECTIONS)[number];

function isPreviewCollection(value: string | null): value is PreviewCollection {
  return COLLECTIONS.includes(value as PreviewCollection);
}

export async function GET(request: Request) {
  await connection();
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const slug = searchParams.get("slug");
  const secret = searchParams.get("secret");
  const path = searchParams.get("path");

  if (!process.env.PREVIEW_SECRET || secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  if (!isPreviewCollection(collection) || !slug || !path) {
    return new Response("Missing or invalid collection, slug or path", {
      status: 400,
    });
  }

  // Never let the preview endpoint act as an open redirect: only the public
  // path that belongs to this collection + slug is allowed.
  if (path !== previewUrl(collection, slug)) {
    return new Response("Invalid preview path", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  // Redirect to the public path
  redirect(path);
}
