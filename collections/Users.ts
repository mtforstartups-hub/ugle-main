import type { Access, CollectionConfig } from "payload";
import { staffAdminAccess } from "../lib/payload/access";

const isAdmin: Access = ({ req: { user } }) => Boolean(user && user.role === "admin");

export const Users: CollectionConfig = {
  slug: "users",
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000, // 10 minutes
    useAPIKey: false,
    cookies: { sameSite: "Lax" },
  },
  admin: {
    useAsTitle: "email",
    defaultColumns: ["avatar", "email", "name", "role", "createdAt"],
    group: "Admin",
    // Editors manage content; the account view is reachable from the avatar menu.
    hidden: ({ user }) => user?.role !== "admin",
    components: {
      // Prevent access to user management for editors
    },
  },
  access: {
    admin: staffAdminAccess,
    create: isAdmin,
    read: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    update: ({ req: { user } }) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return { id: { equals: user.id } };
    },
    delete: isAdmin,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "editor",
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
      ],
      admin: {
        position: "sidebar",
        description: "Admins manage users and permanent deletes. Editors manage content.",
      },
    },
    {
      name: "avatar",
      type: "upload",
      relationTo: "media",
      required: false,
      admin: {
        position: "sidebar",
        components: {
          Cell: "/components/admin/AvatarCell#AvatarCell",
        },
      },
    },
  ],
};
