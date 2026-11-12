import type { Field } from "payload";

export const publishedAtField: Field = {
  name: "publishedAt",
  type: "date",
  required: true,
  admin: {
    position: "sidebar",
    date: { pickerAppearance: "dayAndTime" },
    description: "Publication date. Defaults to now on first publish.",
  },
  defaultValue: () => new Date().toISOString(),
};
