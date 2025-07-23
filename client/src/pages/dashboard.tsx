import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  ArrowRight,
  Lightbulb,
  Brain
} from "lucide-react";
import { useLocation } from "wouter";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  const { data: clients, isLoading: clientsLoading } = useQuery({
    queryKey: ["/api/v1/clients"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ["/api/v1/invoices"],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery({
    queryKey: ["/api/v1/expenses"],
  });

  // Calculate summary statistics
  const totalAR = (invoices || []).reduce((sum: number, inv: any) => 
    inv.status === "pending" ? sum + parseFloat(inv.amount) : sum, 0);
  
  const totalAP = (expenses || []).reduce((sum: number, exp: any) => 
    exp.status === "pending" ? sum + parseFloat(exp.amount) : sum, 0);

  const overdueInvoices = (invoices || []).filter((inv: any) => 
    inv.status === "overdue" || 
    (inv.status === "pending" && new Date(inv.dueDate) < new Date())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Dashboard"
          subtitle="Welcome back! Here's what's happening with your clients."
          actions={
            <Button 
              className="btn-violet flex items-center space-x-2"
              onClick={() => navigate("/onboarding")}
            >
              <Users className="w-4 h-4" />
              <span>Add Client</span>
            </Button>
          }
        />
        
        <div className="p-6">
          {/* AI Insights Banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">Cash flow forecast: +15% next month</h3>
                  <p className="text-sm text-slate-600">Based on current invoices and payment patterns</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                View Details →
              </Button>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {/* Portfolio Summary */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">Portfolio Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total AR</span>
                  <span className="font-semibold text-green-600">${totalAR.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Total AP</span>
                  <span className="font-semibold text-red-600">${totalAP.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Net Position</span>
                  <span className="font-semibold text-slate-800">${(totalAR - totalAP).toLocaleString()}</span>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Active Clients</span>
                    <span className="font-semibold text-violet-600">{(clients || []).length}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Invoices */}
            <Card className="stat-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-slate-800">Overdue Invoices</CardTitle>
                  {overdueInvoices.length > 0 && (
                    <Badge variant="destructive">{overdueInvoices.length} overdue</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {overdueInvoices.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">
                    <p>No overdue invoices</p>
                  </div>
                ) : (
                  overdueInvoices.slice(0, 3).map((invoice: any) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border border-red-100 rounded-lg bg-red-50">
                      <div>
                        <p className="font-medium text-slate-800">Client #{invoice.clientId}</p>
                        <p className="text-sm text-slate-600">Invoice #{invoice.invoiceNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">${invoice.amount}</p>
                        <Button variant="ghost" size="sm" className="text-xs text-red-600 hover:text-red-700">
                          Send Reminder
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card className="stat-card">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-slate-800">AI Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-100 rounded-lg flex items-center justify-center mt-0.5">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-amber-800">Anomaly Detected</p>
                      <p className="text-sm text-amber-700">Unusual expense pattern detected for office supplies</p>
                      <Button variant="link" className="text-xs text-amber-700 hover:text-amber-800 p-0 h-auto mt-1">
                        Review →
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center mt-0.5">
                      <Lightbulb className="w-3 h-3 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-800">Optimization Tip</p>
                      <p className="text-sm text-blue-700">Consider payment terms adjustment for Client Y</p>
                      <Button variant="link" className="text-xs text-blue-700 hover:text-blue-800 p-0 h-auto mt-1">
                        View Details →
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="stat-card cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/invoicing")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Create Invoice</p>
                    <p className="text-lg font-semibold text-slate-800">Quick Bill</p>
                  </div>
                  <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="stat-card cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/expenses")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Add Expense</p>
                    <p className="text-lg font-semibold text-slate-800">Upload Receipt</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="stat-card cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/reports")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Generate Report</p>
                    <p className="text-lg font-semibold text-slate-800">AI Analysis</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="stat-card cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => navigate("/onboarding")}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Onboard Client</p>
                    <p className="text-lg font-semibold text-slate-800">AI Setup</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
