"use client";

import { RichText } from "@/app/components/content/RichText";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

interface PostContentProps {
  content: SerializedEditorState | null | undefined;
}

export function PostContent({ content }: PostContentProps) {
  return <RichText data={content} />;
}