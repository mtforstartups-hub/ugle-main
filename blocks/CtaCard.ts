import type { Block } from "payload";

export const CtaCard: Block = {
  slug: "ctaCard",
  interfaceName: "CtaCardBlock",
  labels: { singular: "CTA card", plural: "CTA cards" },
  fields: [
    { name: "eyebrow", type: "text", required: false },
    { name: "title", type: "text", required: true },
    { name: "body", type: "textarea", required: false },
    { name: "buttonLabel", type: "text", required: false },
    { name: "buttonHref", type: "text", required: false },
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
