import type { CollectionConfig } from "payload";
import { slug } from "../fields/slug";

export const Authors: CollectionConfig = {
  slug: "authors",
  admin: {
    useAsTitle: "name",
    group: "Taxonomy",
    defaultColumns: ["name", "slug", "role"],
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
    { name: "role", type: "text", required: false, admin: { position: "sidebar", description: "e.g. Product team" } },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    { name: "bio", type: "textarea", required: false },
    {
      name: "links",
      type: "array",
      fields: [
        { name: "label", type: "text", required: true },
        { name: "url", type: "text", required: true },
      ],
    },
  ],
};
