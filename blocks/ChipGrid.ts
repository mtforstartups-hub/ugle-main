import type { Block } from "payload";

export const ChipGrid: Block = {
  slug: "chipGrid",
  interfaceName: "ChipGridBlock",
  labels: { singular: "Chip grid", plural: "Chip grids" },
  fields: [
    { name: "title", type: "text", required: false },
    {
      name: "items",
      type: "array",
      required: true,
      minRows: 1,
      fields: [{ name: "text", type: "text", required: true }],
    },
  ],
};
