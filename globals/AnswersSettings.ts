import type { GlobalConfig } from "payload";
import { adminOnly } from "../lib/payload/access";
import { ctaField } from "../fields/cta";

export const AnswersSettings: GlobalConfig = {
  slug: "answers-settings",
  label: "Answers settings",
  admin: {
    group: "Settings",
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    { name: "heroEyebrow", type: "text", defaultValue: "Answers" },
    { name: "heroTitle", type: "text", defaultValue: "Product questions, answered." },
    {
      name: "heroDescription",
      type: "textarea",
      defaultValue: "Direct answers about Ugle — privacy, search, transcription, pricing and platforms.",
    },
    ctaField,
    {
      name: "showHelpful",
      type: "checkbox",
      defaultValue: false,
      admin: { description: '"Was this helpful?" widget (optional).' },
    },
  ],
};
