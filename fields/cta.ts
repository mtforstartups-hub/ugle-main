import type { Field } from "payload";

/**
 * Shared CTA group used by posts, answers and globals as a fallback.
 * Every field is optional so the group can be left empty and the
 * renderer can fall back to the next source (post -> global -> default).
 */
export const ctaField: Field = {
  name: "cta",
  type: "group",
  fields: [
    { name: "eyebrow", type: "text" },
    { name: "title", type: "text" },
    { name: "body", type: "textarea" },
    { name: "buttonLabel", type: "text" },
    { name: "buttonHref", type: "text" },
    {
      name: "variant",
      type: "select",
      options: [
        { label: "Dark", value: "dark" },
        { label: "Light", value: "light" },
        { label: "Green", value: "green" },
      ],
      defaultValue: "dark",
    },
  ],
};
