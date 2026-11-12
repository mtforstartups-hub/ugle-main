import type { GlobalConfig } from "payload";
import { adminOnly } from "../lib/payload/access";
import { ctaField } from "../fields/cta";

export const BlogSettings: GlobalConfig = {
  slug: "blog-settings",
  label: "Blog settings",
  admin: {
    group: "Settings",
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    { name: "heroEyebrow", type: "text", defaultValue: "Blog" },
    { name: "heroTitle", type: "text", defaultValue: "Thoughts & Workflow." },
    {
      name: "heroDescription",
      type: "textarea",
      defaultValue: "Product thinking. Workflow observations. Opinions on how media professionals work.",
    },
    { name: "postsPerPage", type: "number", defaultValue: 5, admin: { description: "Default 5 to match current behaviour." } },
    ctaField,
    {
      name: "featuredPost",
      type: "relationship",
      relationTo: "posts",
      required: false,
    },
  ],
};
