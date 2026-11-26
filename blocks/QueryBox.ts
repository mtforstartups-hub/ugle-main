import type { Block } from "payload";

export const QueryBox: Block = {
  slug: "queryBox",
  interfaceName: "QueryBoxBlock",
  labels: { singular: "Query box", plural: "Query boxes" },
  fields: [
    { name: "label", type: "text", required: true },
    { name: "query", type: "text", required: true },
    { name: "description", type: "textarea", required: false },
  ],
};
