import { slugField } from "payload";

/**
 * Native Payload slug field. Use in `fields: [ ... ]` arrays.
 * Defaults to `name: "slug"`, `useAsSlug: "title"` — pass the source explicitly.
 */
export const slug = (useAsSlug: string) => slugField({ useAsSlug });
