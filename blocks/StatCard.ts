import type { Block } from "payload";

export const StatCard: Block = {
  slug: "statCard",
  interfaceName: "StatCardBlock",
  labels: { singular: "Stat card", plural: "Stat cards" },
  fields: [
    { name: "value", type: "text", required: true },
    { name: "label", type: "text", required: true },
    { name: "description", type: "textarea", required: false },
    {
      name: "theme",
      type: "select",
      options: [
        { label: "Default", value: "default" },
        { label: "Dark", value: "dark" },
      ],
      defaultValue: "default",
    },
  ],
};
