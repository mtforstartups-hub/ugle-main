import type { Block } from "payload";

export const MediaBlock: Block = {
  slug: "mediaBlock",
  interfaceName: "MediaBlockBlock",
  labels: { singular: "Media block", plural: "Media blocks" },
  fields: [
    { name: "image", type: "upload", relationTo: "media", required: true },
    { name: "caption", type: "text", required: false },
    {
      name: "size",
      type: "select",
      options: [
        { label: "Full", value: "full" },
        { label: "Large", value: "large" },
        { label: "Medium", value: "medium" },
      ],
      defaultValue: "full",
    },
    {
      name: "alignment",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
      ],
      defaultValue: "center",
    },
  ],
};
