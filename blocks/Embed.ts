import type { Block } from "payload";

export const Embed: Block = {
  slug: "embed",
  interfaceName: "EmbedBlock",
  labels: { singular: "Embed", plural: "Embeds" },
  fields: [
    { name: "url", type: "text", required: true },
    { name: "title", type: "text", required: false },
    { name: "caption", type: "textarea", required: false },
    {
      name: "aspectRatio",
      type: "select",
      options: [
        { label: "16:9", value: "16:9" },
        { label: "4:3", value: "4:3" },
        { label: "1:1", value: "1:1" },
      ],
      defaultValue: "16:9",
    },
  ],
};
