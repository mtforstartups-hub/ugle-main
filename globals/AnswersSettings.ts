import type { GlobalConfig } from "payload";
import { ctaField } from "../fields/cta";

export const AnswersSettings: GlobalConfig = {
  slug: "answers-settings",
  label: "Answers settings",
  admin: { group: "Settings" },
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
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
