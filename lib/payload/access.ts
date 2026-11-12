import type { Access, AccessArgs } from "payload";

/**
 * Public read: published only. Staff: everything.
 */
export const publicOrStaffRead: Access = ({ req: { user } }) => {
  if (user) return true;
  return { _status: { equals: "published" } };
};

export const staffCreate: Access = ({ req: { user } }) => Boolean(user);
export const staffUpdate: Access = ({ req: { user } }) => Boolean(user);
export const adminOnly: Access = ({ req: { user } }) =>
  Boolean(user?.role === "admin");
export const adminDelete: Access = adminOnly;

/**
 * Payload asks the auth collection's `access.admin` whether a user may enter
 * `/admin` at all. Both roles sign in; the panel then hides admin-only
 * collections and globals from editors.
 */
export const staffAdminAccess = ({ req: { user } }: AccessArgs): boolean =>
  Boolean(user?.role === "admin" || user?.role === "editor");

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
