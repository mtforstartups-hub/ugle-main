import { draftMode } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  await connection();
  const { searchParams } = new URL(request.url);
  const collection = searchParams.get("collection");
  const slug = searchParams.get("slug");
  const secret = searchParams.get("secret");
  const path = searchParams.get("path");

  if (secret !== process.env.PREVIEW_SECRET) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  if (!collection || !slug || !path) {
    return new Response("Missing collection, slug or path", { status: 400 });
  }

  const draft = await draftMode();
  draft.enable();

  // Redirect to the public path
  redirect(path);
}
