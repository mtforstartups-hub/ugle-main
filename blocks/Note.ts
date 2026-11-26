import type { Block } from "payload";

export const Note: Block = {
  slug: "note",
  interfaceName: "NoteBlock",
  labels: { singular: "Note", plural: "Notes" },
  fields: [
    { name: "body", type: "textarea", required: true },
    {
      name: "variant",
      type: "select",
      options: [
        { label: "Gray", value: "gray" },
        { label: "Green", value: "green" },
        { label: "Amber", value: "amber" },
      ],
      defaultValue: "gray",
    },
  ],
};
