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

/**
 * Collections with `trash: true` run soft deletes through the update
 * operation, passing `data.deletedAt`. Editors may trash documents, but only
 * admins may delete them permanently.
 */
export const staffTrashOrAdminDelete: Access = ({ req: { user }, data }) => {
  if (!user) return false;
  if (user.role === "admin") return true;

  const isTrashAttempt =
    Boolean(data) &&
    typeof data === "object" &&
    "deletedAt" in data &&
    Boolean((data as { deletedAt?: unknown }).deletedAt);

  return isTrashAttempt;
};
