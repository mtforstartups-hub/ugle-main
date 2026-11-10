import { draftMode } from "next/headers";
import { connection } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  await connection();
  const draft = await draftMode();
  draft.disable();

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "/";
  redirect(path);
}
