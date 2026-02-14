import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, uniqueIndex } from "drizzle-orm/mysql-core";
import { users } from "./schema";

// ============================================================================
// ROLES TABLE
// ============================================================================
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  description: text("description"),
  level: int("level").notNull().default(0), // Higher = more permissions. Owner=100, Admin=80, HR=60, Coach=40, Learner=20
  isSystem: boolean("isSystem").default(false), // System roles cannot be deleted
  maxUsers: int("maxUsers"), // null = unlimited
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

// ============================================================================
// PERMISSIONS TABLE
// ============================================================================
export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  module: varchar("module", { length: 50 }).notNull(), // products, sales, website, marketing, insights, people, settings
  submodule: varchar("submodule", { length: 50 }).notNull(), // courses, coaching, payments, etc.
  action: mysqlEnum("action", ["view", "create", "edit", "delete", "export"]).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniquePermission: uniqueIndex("unique_permission").on(table.module, table.submodule, table.action),
}));

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

// ============================================================================
// ROLE_PERMISSIONS TABLE (Many-to-Many)
// ============================================================================
export const rolePermissions = mysqlTable("role_permissions", {
  id: int("id").autoincrement().primaryKey(),
  roleId: int("roleId").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: int("permissionId").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueRolePermission: uniqueIndex("unique_role_permission").on(table.roleId, table.permissionId),
}));

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = typeof rolePermissions.$inferInsert;

// ============================================================================
// USER_PERMISSIONS TABLE (Custom overrides per user)
// ============================================================================
export const userPermissions = mysqlTable("user_permissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  permissionId: int("permissionId").notNull().references(() => permissions.id, { onDelete: "cascade" }),
  granted: boolean("granted").default(true), // true = grant, false = revoke
  grantedBy: int("grantedBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  uniqueUserPermission: uniqueIndex("unique_user_permission").on(table.userId, table.permissionId),
}));

export type UserPermission = typeof userPermissions.$inferSelect;
export type InsertUserPermission = typeof userPermissions.$inferInsert;

// ============================================================================
// PASSWORD_RESET_TOKENS TABLE
// ============================================================================
export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: varchar("token", { length: 255 }).notNull().unique(),
  type: mysqlEnum("type", ["reset", "setup", "magic_link"]).default("reset").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

// ============================================================================
// ADMIN_INVITATIONS TABLE (For inviting new admins)
// ============================================================================
export const adminInvitations = mysqlTable("admin_invitations", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  roleId: int("roleId").notNull().references(() => roles.id),
  invitedBy: int("invitedBy").notNull().references(() => users.id),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  acceptedAt: timestamp("acceptedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AdminInvitation = typeof adminInvitations.$inferSelect;
export type InsertAdminInvitation = typeof adminInvitations.$inferInsert;

// ============================================================================
// AUDIT_LOG TABLE (Track admin actions)
// ============================================================================
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  action: varchar("action", { length: 100 }).notNull(), // e.g., "user.create", "course.delete"
  targetType: varchar("targetType", { length: 50 }), // e.g., "user", "course"
  targetId: int("targetId"),
  details: text("details"), // JSON with additional context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;
