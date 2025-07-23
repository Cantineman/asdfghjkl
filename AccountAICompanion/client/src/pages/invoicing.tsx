import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Search, 
  Download, 
  Send, 
  Eye, 
  MoreHorizontal,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useConfetti } from "@/hooks/use-confetti";

export default function Invoicing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");
  const { toast } = useToast();
  const { triggerConfetti } = useConfetti();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["/api/v1/clients"],
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/v1/invoices"],
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/v1/invoices/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/invoices"] });
      toast({
        title: "Invoice Updated",
        description: "Invoice status has been updated successfully.",
      });
    },
  });

  const sendReminderMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      // Simulate sending reminder
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Reminder Sent!",
        description: "Payment reminder has been sent to the client.",
      });
    },
  });

  // Calculate statistics
  const totalOwed = (invoices || []).reduce((sum: number, inv: any) => 
    inv.status === "pending" ? sum + parseFloat(inv.amount) : sum, 0);
  
  const paidThisMonth = (invoices || []).reduce((sum: number, inv: any) => 
    inv.status === "paid" ? sum + parseFloat(inv.amount) : sum, 0);
  
  const overdue = (invoices || []).reduce((sum: number, inv: any) => 
    inv.status === "overdue" ? sum + parseFloat(inv.amount) : sum, 0);

  const overdueInvoices = (invoices || []).filter((inv: any) => inv.status === "overdue");

  const handleMarkPaid = (invoiceId: number) => {
    updateInvoiceMutation.mutate({
      id: invoiceId,
      updates: { status: "paid" }
    });
    triggerConfetti();
  };

  const handleSendReminder = (invoiceId: number) => {
    sendReminderMutation.mutate(invoiceId);
  };

  const filteredInvoices = (invoices || []).filter((invoice: any) => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (clients || []).find((c: any) => c.id === invoice.clientId)?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    const matchesClient = clientFilter === "all" || invoice.clientId.toString() === clientFilter;
    
    return matchesSearch && matchesStatus && matchesClient;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Invoicing & Sales"
          subtitle="Track invoices and manage client payments efficiently."
          actions={
            <Button className="btn-violet flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Button>
          }
        />
        
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Owed</p>
                    <p className="text-2xl font-bold text-slate-800">${totalOwed.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Paid This Month</p>
                    <p className="text-2xl font-bold text-green-600">${paidThisMonth.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Overdue</p>
                    <p className="text-2xl font-bold text-red-600">${overdue.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Avg. Payment Time</p>
                    <p className="text-2xl font-bold text-slate-800">12 days</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestion Banner */}
          {overdueInvoices.length > 0 && (
            <div className="mb-6 p-4 ai-suggestion">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">AI Suggestion</h3>
                    <p className="text-sm text-slate-600">
                      {overdueInvoices.length} overdue invoices detected. Send automated reminders?
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-slate-600">
                    Dismiss
                  </Button>
                  <Button size="sm" className="btn-violet">
                    Send Reminders
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <Card className="stat-card mb-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Clients</SelectItem>
                      {clients?.map((client: any) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    Batch Actions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Table */}
          <Card className="stat-card">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">All Invoices</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-slate-600">Loading invoices...</span>
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No invoices found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <Checkbox />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Invoice #
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Due Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredInvoices.map((invoice: any) => {
                        const client = clients?.find((c: any) => c.id === invoice.clientId);
                        const isOverdue = invoice.status === "overdue" || 
                          (invoice.status === "pending" && new Date(invoice.dueDate) < new Date());
                        
                        return (
                          <tr key={invoice.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Checkbox />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-violet-600 font-medium">#{invoice.invoiceNumber}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-slate-600">
                                    {client?.name?.charAt(0) || 'C'}
                                  </span>
                                </div>
                                <span className="font-medium text-slate-800">{client?.name || 'Unknown Client'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                              ${parseFloat(invoice.amount).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                              {new Date(invoice.dueDate).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={
                                  invoice.status === "paid" ? "default" :
                                  isOverdue ? "destructive" : "secondary"
                                }
                                className={
                                  invoice.status === "paid" ? "bg-green-100 text-green-800" :
                                  isOverdue ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                                }
                              >
                                {invoice.status === "paid" ? "Paid" : 
                                 isOverdue ? "Overdue" : "Pending"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                {invoice.status !== "paid" && (
                                  <>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleSendReminder(invoice.id)}
                                      disabled={sendReminderMutation.isPending}
                                    >
                                      <Send className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleMarkPaid(invoice.id)}
                                      disabled={updateInvoiceMutation.isPending}
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  </>
                                )}
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
