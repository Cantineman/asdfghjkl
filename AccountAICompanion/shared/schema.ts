import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  company: text("company"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  businessType: text("business_type").notNull(),
  taxId: text("tax_id"),
  industry: text("industry"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  userId: integer("user_id").notNull(),
  invoiceNumber: text("invoice_number").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "pending", "paid", "overdue"
  dueDate: timestamp("due_date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  userId: integer("user_id").notNull(),
  vendor: text("vendor").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  description: text("description"),
  status: text("status").notNull(), // "pending", "approved", "flagged"
  receiptUrl: text("receipt_url"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  department: text("department"),
  grossPay: decimal("gross_pay", { precision: 10, scale: 2 }).notNull(),
  netPay: decimal("net_pay", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // "active", "inactive"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id"),
  title: text("title").notNull(),
  type: text("type").notNull(), // "profit_loss", "balance_sheet", "cash_flow", "tax_summary"
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  clientId: integer("client_id").notNull(),
  type: text("type").notNull(), // "plaid", "stripe", "gusto"
  status: text("status").notNull(), // "connected", "disconnected", "error"
  credentials: jsonb("credentials"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  aiAlerts: boolean("ai_alerts").default(true),
  autoCategorize: boolean("auto_categorize").default(true),
  smartReminders: boolean("smart_reminders").default(false),
  emailNotifications: boolean("email_notifications").default(true),
  weeklyReports: boolean("weekly_reports").default(true),
  theme: text("theme").default("light"),
  dateFormat: text("date_format").default("MM/DD/YYYY"),
  currency: text("currency").default("USD"),
  sessionTimeout: text("session_timeout").default("1_hour"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  company: true,
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  businessType: true,
  taxId: true,
  industry: true,
  email: true,
  phone: true,
  address: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  clientId: true,
  invoiceNumber: true,
  amount: true,
  status: true,
  dueDate: true,
  description: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  clientId: true,
  vendor: true,
  amount: true,
  category: true,
  description: true,
  status: true,
  receiptUrl: true,
  dueDate: true,
});

export const insertEmployeeSchema = createInsertSchema(employees).pick({
  clientId: true,
  name: true,
  email: true,
  department: true,
  grossPay: true,
  netPay: true,
  status: true,
});

export const insertReportSchema = createInsertSchema(reports).pick({
  clientId: true,
  title: true,
  type: true,
  data: true,
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  clientId: true,
  type: true,
  status: true,
  credentials: true,
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  aiAlerts: true,
  autoCategorize: true,
  smartReminders: true,
  emailNotifications: true,
  weeklyReports: true,
  theme: true,
  dateFormat: true,
  currency: true,
  sessionTimeout: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
