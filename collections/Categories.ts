import type { CollectionConfig } from "payload";
import { slug } from "../fields/slug";

export const Categories: CollectionConfig = {
  slug: "categories",
  admin: {
    useAsTitle: "name",
    group: "Taxonomy",
    defaultColumns: ["name", "slug", "description"],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user?.role === "admin"),
  },
  fields: [
    { name: "name", type: "text", required: true, index: true },
    slug("name"),
    { name: "description", type: "textarea", required: false },
    {
      name: "color",
      type: "select",
      options: [
        { label: "Green", value: "green" },
        { label: "Blue", value: "blue" },
        { label: "Purple", value: "purple" },
        { label: "Amber", value: "amber" },
        { label: "Slate", value: "slate" },
      ],
    },
    {
      name: "usedFor",
      type: "select",
      hasMany: true,
      options: [
        { label: "Posts", value: "posts" },
        { label: "Answers", value: "answers" },
      ],
      defaultValue: ["posts", "answers"],
    },
  ],
};
