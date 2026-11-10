import type { Block } from "payload";

export const RelatedLinks: Block = {
  slug: "relatedLinks",
  interfaceName: "RelatedLinksBlock",
  labels: { singular: "Related links", plural: "Related links" },
  fields: [
    {
      name: "links",
      type: "array",
      required: true,
      minRows: 1,
      fields: [
        { name: "label", type: "text", required: true },
        { name: "href", type: "text", required: true },
        { name: "description", type: "textarea", required: false },
      ],
    },
  ],
};
