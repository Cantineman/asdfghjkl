import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, insertClientSchema, insertInvoiceSchema, 
  insertExpenseSchema, insertEmployeeSchema, insertReportSchema,
  insertIntegrationSchema, insertSettingsSchema
} from "@shared/schema";
import { z } from "zod";

const authMiddleware = (req: any, res: any, next: any) => {
  // Simple auth - in production would use proper JWT/session
  req.userId = 1; // Mock authenticated user
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/v1/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // In production, generate JWT token
      res.json({ 
        user: { id: user.id, username: user.username, email: user.email, name: user.name },
        token: "mock-jwt-token"
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/v1/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      res.status(201).json({ 
        user: { id: user.id, username: user.username, email: user.email, name: user.name },
        token: "mock-jwt-token"
      });
    } catch (error) {
      res.status(400).json({ message: "Registration failed" });
    }
  });

  // Apply auth middleware to protected routes
  app.use("/api/v1", authMiddleware);

  // Clients
  app.get("/api/v1/clients", async (req, res) => {
    try {
      const clients = await storage.getClients(req.userId);
      res.json(clients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch clients" });
    }
  });

  app.get("/api/v1/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id, req.userId);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch client" });
    }
  });

  app.post("/api/v1/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient({ ...clientData, userId: req.userId });
      res.status(201).json(client);
    } catch (error) {
      res.status(400).json({ message: "Failed to create client" });
    }
  });

  app.patch("/api/v1/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, req.userId, updates);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(400).json({ message: "Failed to update client" });
    }
  });

  app.delete("/api/v1/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteClient(id, req.userId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete client" });
    }
  });

  // Invoices
  app.get("/api/v1/invoices", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const invoices = await storage.getInvoices(req.userId, clientId);
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.post("/api/v1/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice({ ...invoiceData, userId: req.userId });
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Failed to create invoice" });
    }
  });

  app.patch("/api/v1/invoices/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, req.userId, updates);
      
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Failed to update invoice" });
    }
  });

  // Expenses
  app.get("/api/v1/expenses", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const expenses = await storage.getExpenses(req.userId, clientId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post("/api/v1/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense({ ...expenseData, userId: req.userId });
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({ message: "Failed to create expense" });
    }
  });

  app.patch("/api/v1/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, req.userId, updates);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(400).json({ message: "Failed to update expense" });
    }
  });

  // Employees
  app.get("/api/v1/employees", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const employees = await storage.getEmployees(req.userId, clientId);
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.post("/api/v1/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee({ ...employeeData, userId: req.userId });
      res.status(201).json(employee);
    } catch (error) {
      res.status(400).json({ message: "Failed to create employee" });
    }
  });

  app.patch("/api/v1/employees/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(id, req.userId, updates);
      
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      
      res.json(employee);
    } catch (error) {
      res.status(400).json({ message: "Failed to update employee" });
    }
  });

  // Reports
  app.get("/api/v1/reports", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const reports = await storage.getReports(req.userId, clientId);
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  app.post("/api/v1/reports/generate", async (req, res) => {
    try {
      const { type, clientId, dateRange } = req.body;
      
      // Simulate AI report generation
      const reportData = {
        type,
        period: dateRange.period,
        generatedAt: new Date().toISOString(),
        summary: {
          totalRevenue: "110000",
          totalExpenses: "78000",
          netProfit: "32000",
          profitMargin: "29.1"
        }
      };

      const report = await storage.createReport({
        title: `${type.replace('_', ' ').toUpperCase()} Report`,
        type,
        clientId: clientId || null,
        data: reportData,
        userId: req.userId
      });

      res.json(report);
    } catch (error) {
      res.status(400).json({ message: "Failed to generate report" });
    }
  });

  // Integrations
  app.get("/api/v1/integrations/:clientId", async (req, res) => {
    try {
      const clientId = parseInt(req.params.clientId);
      const integrations = await storage.getIntegrations(req.userId, clientId);
      res.json(integrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch integrations" });
    }
  });

  app.post("/api/v1/integrations/test", async (req, res) => {
    try {
      const { type, apiKey } = req.body;
      
      // Simulate API key validation
      if (!apiKey || apiKey.length < 10) {
        return res.status(400).json({ message: "Invalid API key" });
      }

      res.json({ 
        message: `${type} connection successful!`,
        status: "connected"
      });
    } catch (error) {
      res.status(400).json({ message: "Connection test failed" });
    }
  });

  // Settings
  app.get("/api/v1/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings(req.userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.patch("/api/v1/settings", async (req, res) => {
    try {
      const updates = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(req.userId, updates);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Failed to update settings" });
    }
  });

  // AI Support Chat
  app.post("/api/v1/support/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      // Simulate AI response
      const responses = [
        "I can help you with that! Let me analyze your financial data.",
        "Based on your recent transactions, I recommend reviewing your expense categories.",
        "Your cash flow looks healthy. Would you like me to generate a detailed report?",
        "I notice some unusual patterns in your data. Let me flag those for review.",
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      
      res.json({
        message: response,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "AI chat unavailable" });
    }
  });

  // File upload simulation
  app.post("/api/v1/upload", async (req, res) => {
    try {
      // Simulate file processing
      setTimeout(() => {
        res.json({
          filename: "receipt_123.pdf",
          vendor: "Office Depot",
          amount: "127.50",
          category: "Office Supplies",
          extractedData: {
            date: "2024-01-15",
            items: ["Paper", "Pens", "Folders"]
          }
        });
      }, 2000);
    } catch (error) {
      res.status(500).json({ message: "Upload failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
