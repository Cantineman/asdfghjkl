import { 
  users, clients, invoices, expenses, employees, reports, integrations, settings,
  type User, type InsertUser, type Client, type InsertClient, 
  type Invoice, type InsertInvoice, type Expense, type InsertExpense,
  type Employee, type InsertEmployee, type Report, type InsertReport,
  type Integration, type InsertIntegration, type Settings, type InsertSettings
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Clients
  getClients(userId: number): Promise<Client[]>;
  getClient(id: number, userId: number): Promise<Client | undefined>;
  createClient(client: InsertClient & { userId: number }): Promise<Client>;
  updateClient(id: number, userId: number, updates: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number, userId: number): Promise<boolean>;

  // Invoices
  getInvoices(userId: number, clientId?: number): Promise<Invoice[]>;
  getInvoice(id: number, userId: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice & { userId: number }): Promise<Invoice>;
  updateInvoice(id: number, userId: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number, userId: number): Promise<boolean>;

  // Expenses
  getExpenses(userId: number, clientId?: number): Promise<Expense[]>;
  getExpense(id: number, userId: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense & { userId: number }): Promise<Expense>;
  updateExpense(id: number, userId: number, updates: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number, userId: number): Promise<boolean>;

  // Employees
  getEmployees(userId: number, clientId?: number): Promise<Employee[]>;
  getEmployee(id: number, userId: number): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee & { userId: number }): Promise<Employee>;
  updateEmployee(id: number, userId: number, updates: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: number, userId: number): Promise<boolean>;

  // Reports
  getReports(userId: number, clientId?: number): Promise<Report[]>;
  getReport(id: number, userId: number): Promise<Report | undefined>;
  createReport(report: InsertReport & { userId: number }): Promise<Report>;
  deleteReport(id: number, userId: number): Promise<boolean>;

  // Integrations
  getIntegrations(userId: number, clientId?: number): Promise<Integration[]>;
  getIntegration(id: number, userId: number): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration & { userId: number }): Promise<Integration>;
  updateIntegration(id: number, userId: number, updates: Partial<InsertIntegration>): Promise<Integration | undefined>;
  deleteIntegration(id: number, userId: number): Promise<boolean>;

  // Settings
  getSettings(userId: number): Promise<Settings | undefined>;
  updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private clients: Map<number, Client> = new Map();
  private invoices: Map<number, Invoice> = new Map();
  private expenses: Map<number, Expense> = new Map();
  private employees: Map<number, Employee> = new Map();
  private reports: Map<number, Report> = new Map();
  private integrations: Map<number, Integration> = new Map();
  private settings: Map<number, Settings> = new Map();
  private currentId: number = 1;

  constructor() {
    // Seed with demo data
    this.seedData();
  }

  private seedData() {
    // Create demo user
    const user: User = {
      id: 1,
      username: "accountant",
      password: "password123",
      email: "accountant@example.com",
      name: "John Accountant",
      company: "Professional Accounting Services",
      createdAt: new Date(),
    };
    this.users.set(1, user);

    // Create demo clients
    const clients: Client[] = [
      {
        id: 1,
        userId: 1,
        name: "Acme Corp",
        businessType: "LLC",
        taxId: "12-3456789",
        industry: "Technology",
        email: "contact@acmecorp.com",
        phone: "(555) 123-4567",
        address: "123 Business St, City, ST 12345",
        createdAt: new Date(),
      },
      {
        id: 2,
        userId: 1,
        name: "TechStart Inc",
        businessType: "Corporation",
        taxId: "98-7654321",
        industry: "Technology",
        email: "info@techstart.com",
        phone: "(555) 987-6543",
        address: "456 Startup Ave, City, ST 12345",
        createdAt: new Date(),
      },
      {
        id: 3,
        userId: 1,
        name: "Local Bakery",
        businessType: "Sole Proprietorship",
        taxId: "11-2233445",
        industry: "Food Service",
        email: "hello@localbakery.com",
        phone: "(555) 111-2222",
        address: "789 Main St, City, ST 12345",
        createdAt: new Date(),
      },
    ];
    clients.forEach(client => this.clients.set(client.id, client));

    // Create demo settings
    const userSettings: Settings = {
      id: 1,
      userId: 1,
      aiAlerts: true,
      autoCategorize: true,
      smartReminders: false,
      emailNotifications: true,
      weeklyReports: true,
      theme: "light",
      dateFormat: "MM/DD/YYYY",
      currency: "USD",
      sessionTimeout: "1_hour",
    };
    this.settings.set(1, userSettings);

    this.currentId = 4;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Clients
  async getClients(userId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.userId === userId);
  }

  async getClient(id: number, userId: number): Promise<Client | undefined> {
    const client = this.clients.get(id);
    return client && client.userId === userId ? client : undefined;
  }

  async createClient(clientData: InsertClient & { userId: number }): Promise<Client> {
    const id = this.currentId++;
    const client: Client = {
      ...clientData,
      id,
      createdAt: new Date(),
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, userId: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client || client.userId !== userId) return undefined;

    const updatedClient: Client = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number, userId: number): Promise<boolean> {
    const client = this.clients.get(id);
    if (!client || client.userId !== userId) return false;

    this.clients.delete(id);
    return true;
  }

  // Invoices
  async getInvoices(userId: number, clientId?: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(invoice => 
      invoice.userId === userId && (!clientId || invoice.clientId === clientId)
    );
  }

  async getInvoice(id: number, userId: number): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    return invoice && invoice.userId === userId ? invoice : undefined;
  }

  async createInvoice(invoiceData: InsertInvoice & { userId: number }): Promise<Invoice> {
    const id = this.currentId++;
    const invoice: Invoice = {
      ...invoiceData,
      id,
      createdAt: new Date(),
    };
    this.invoices.set(id, invoice);
    return invoice;
  }

  async updateInvoice(id: number, userId: number, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const invoice = this.invoices.get(id);
    if (!invoice || invoice.userId !== userId) return undefined;

    const updatedInvoice: Invoice = { ...invoice, ...updates };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number, userId: number): Promise<boolean> {
    const invoice = this.invoices.get(id);
    if (!invoice || invoice.userId !== userId) return false;

    this.invoices.delete(id);
    return true;
  }

  // Expenses
  async getExpenses(userId: number, clientId?: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => 
      expense.userId === userId && (!clientId || expense.clientId === clientId)
    );
  }

  async getExpense(id: number, userId: number): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    return expense && expense.userId === userId ? expense : undefined;
  }

  async createExpense(expenseData: InsertExpense & { userId: number }): Promise<Expense> {
    const id = this.currentId++;
    const expense: Expense = {
      ...expenseData,
      id,
      createdAt: new Date(),
    };
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: number, userId: number, updates: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense || expense.userId !== userId) return undefined;

    const updatedExpense: Expense = { ...expense, ...updates };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }

  async deleteExpense(id: number, userId: number): Promise<boolean> {
    const expense = this.expenses.get(id);
    if (!expense || expense.userId !== userId) return false;

    this.expenses.delete(id);
    return true;
  }

  // Employees
  async getEmployees(userId: number, clientId?: number): Promise<Employee[]> {
    return Array.from(this.employees.values()).filter(employee => 
      employee.userId === userId && (!clientId || employee.clientId === clientId)
    );
  }

  async getEmployee(id: number, userId: number): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    return employee && employee.userId === userId ? employee : undefined;
  }

  async createEmployee(employeeData: InsertEmployee & { userId: number }): Promise<Employee> {
    const id = this.currentId++;
    const employee: Employee = {
      ...employeeData,
      id,
      createdAt: new Date(),
    };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: number, userId: number, updates: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee || employee.userId !== userId) return undefined;

    const updatedEmployee: Employee = { ...employee, ...updates };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: number, userId: number): Promise<boolean> {
    const employee = this.employees.get(id);
    if (!employee || employee.userId !== userId) return false;

    this.employees.delete(id);
    return true;
  }

  // Reports
  async getReports(userId: number, clientId?: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(report => 
      report.userId === userId && (!clientId || report.clientId === clientId)
    );
  }

  async getReport(id: number, userId: number): Promise<Report | undefined> {
    const report = this.reports.get(id);
    return report && report.userId === userId ? report : undefined;
  }

  async createReport(reportData: InsertReport & { userId: number }): Promise<Report> {
    const id = this.currentId++;
    const report: Report = {
      ...reportData,
      id,
      createdAt: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  async deleteReport(id: number, userId: number): Promise<boolean> {
    const report = this.reports.get(id);
    if (!report || report.userId !== userId) return false;

    this.reports.delete(id);
    return true;
  }

  // Integrations
  async getIntegrations(userId: number, clientId?: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(integration => 
      integration.userId === userId && (!clientId || integration.clientId === clientId)
    );
  }

  async getIntegration(id: number, userId: number): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    return integration && integration.userId === userId ? integration : undefined;
  }

  async createIntegration(integrationData: InsertIntegration & { userId: number }): Promise<Integration> {
    const id = this.currentId++;
    const integration: Integration = {
      ...integrationData,
      id,
      createdAt: new Date(),
    };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: number, userId: number, updates: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration || integration.userId !== userId) return undefined;

    const updatedIntegration: Integration = { ...integration, ...updates };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteIntegration(id: number, userId: number): Promise<boolean> {
    const integration = this.integrations.get(id);
    if (!integration || integration.userId !== userId) return false;

    this.integrations.delete(id);
    return true;
  }

  // Settings
  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(setting => setting.userId === userId);
  }

  async updateSettings(userId: number, updates: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings(userId);
    if (existing) {
      const updated: Settings = { ...existing, ...updates };
      this.settings.set(existing.id, updated);
      return updated;
    } else {
      const id = this.currentId++;
      const newSettings: Settings = {
        id,
        userId,
        aiAlerts: true,
        autoCategorize: true,
        smartReminders: false,
        emailNotifications: true,
        weeklyReports: true,
        theme: "light",
        dateFormat: "MM/DD/YYYY",
        currency: "USD",
        sessionTimeout: "1_hour",
        ...updates,
      };
      this.settings.set(id, newSettings);
      return newSettings;
    }
  }
}

export const storage = new MemStorage();
