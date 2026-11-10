import type { Access } from "payload";

/**
 * Public read: published only. Staff: everything.
 */
export const publicOrStaffRead: Access = ({ req: { user } }) => {
  if (user) return true;
  return { _status: { equals: "published" } };
};

export const staffCreate: Access = ({ req: { user } }) => Boolean(user);
export const staffUpdate: Access = ({ req: { user } }) => Boolean(user);
export const adminDelete: Access = ({ req: { user } }) =>
  Boolean(user?.role === "admin");
