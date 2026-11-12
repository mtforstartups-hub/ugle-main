import { describe, expect, it } from "vitest";
import type { AccessArgs } from "payload";

import {
  adminDelete,
  adminOnly,
  publicOrStaffRead,
  staffAdminAccess,
  staffCreate,
  staffTrashOrAdminDelete,
  staffUpdate,
} from "../access";

type TestUser = { id: number; email: string; role: "admin" | "editor" };

const asArgs = (user?: TestUser) => ({ req: { user } }) as unknown as AccessArgs;

const admin: TestUser = { id: 1, email: "admin@ugle.ai", role: "admin" };
const editor: TestUser = { id: 2, email: "editor@ugle.ai", role: "editor" };

describe("payload access control", () => {
  describe("publicOrStaffRead", () => {
    it("limits anonymous visitors to published documents", () => {
      expect(publicOrStaffRead(asArgs())).toEqual({
        _status: { equals: "published" },
      });
    });

    it("lets any signed-in user read everything", () => {
      expect(publicOrStaffRead(asArgs(editor))).toBe(true);
      expect(publicOrStaffRead(asArgs(admin))).toBe(true);
    });
  });

  describe("staffCreate / staffUpdate", () => {
    it("rejects anonymous writes", () => {
      expect(staffCreate(asArgs())).toBe(false);
      expect(staffUpdate(asArgs())).toBe(false);
    });

    it("allows editors and admins to write content", () => {
      expect(staffCreate(asArgs(editor))).toBe(true);
      expect(staffCreate(asArgs(admin))).toBe(true);
      expect(staffUpdate(asArgs(editor))).toBe(true);
      expect(staffUpdate(asArgs(admin))).toBe(true);
    });
  });

  describe("adminDelete / adminOnly", () => {
    it("is admin-only", () => {
      expect(adminDelete(asArgs())).toBe(false);
      expect(adminDelete(asArgs(editor))).toBe(false);
      expect(adminDelete(asArgs(admin))).toBe(true);
    });

    it("keeps settings and media deletion away from editors", () => {
      expect(adminOnly(asArgs())).toBe(false);
      expect(adminOnly(asArgs(editor))).toBe(false);
      expect(adminOnly(asArgs(admin))).toBe(true);
    });
  });

  describe("staffAdminAccess", () => {
    it("lets both roles sign in to the admin panel", () => {
      expect(staffAdminAccess(asArgs(editor))).toBe(true);
      expect(staffAdminAccess(asArgs(admin))).toBe(true);
    });

    it("keeps anonymous visitors out", () => {
      expect(staffAdminAccess(asArgs())).toBe(false);
    });
  });

  describe("staffTrashOrAdminDelete", () => {
    const asDeleteArgs = (
      user?: TestUser,
      data?: Record<string, unknown>,
    ) => ({ req: { user }, data }) as unknown as AccessArgs;

    it("rejects anonymous deletes", () => {
      expect(staffTrashOrAdminDelete(asDeleteArgs())).toBe(false);
    });

    it("lets editors soft-delete but not permanently delete", () => {
      expect(
        staffTrashOrAdminDelete(
          asDeleteArgs(editor, { deletedAt: new Date().toISOString() }),
        ),
      ).toBe(true);
      expect(staffTrashOrAdminDelete(asDeleteArgs(editor))).toBe(false);
      expect(staffTrashOrAdminDelete(asDeleteArgs(editor, { deletedAt: null }))).toBe(
        false,
      );
    });

    it("always allows admins to delete", () => {
      expect(staffTrashOrAdminDelete(asDeleteArgs(admin))).toBe(true);
    });
  });
});
