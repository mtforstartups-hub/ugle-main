import { RichText as PayloadRichText } from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";

import { jsxConverters } from "./converters";

export function RichText({ data }: { data: SerializedEditorState | null | undefined }) {
  if (!data?.root) return null;

  return <PayloadRichText data={data} converters={jsxConverters} />;
}
