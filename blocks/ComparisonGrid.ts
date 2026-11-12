import type { Block } from "payload";

export const ComparisonGrid: Block = {
  slug: "comparisonGrid",
  interfaceName: "ComparisonGridBlock",
  labels: { singular: "Comparison grid", plural: "Comparison grids" },
  fields: [
    { name: "leftLabel", type: "text", required: true },
    { name: "leftValue", type: "textarea", required: true },
    { name: "rightLabel", type: "text", required: true },
    { name: "rightValue", type: "textarea", required: true },
  ],
};
