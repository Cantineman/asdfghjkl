import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, 
  Search, 
  Download, 
  Eye, 
  Check, 
  AlertTriangle,
  DollarSign,
  Clock,
  TrendingUp,
  Receipt,
  Lightbulb,
  FileText,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useConfetti } from "@/hooks/use-confetti";

export default function Expenses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isUploadProcessing, setIsUploadProcessing] = useState(false);
  const { toast } = useToast();
  const { triggerConfetti } = useConfetti();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["/api/v1/clients"],
  });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["/api/v1/expenses"],
  });

  const approveExpenseMutation = useMutation({
    mutationFn: async (expenseId: number) => {
      const response = await apiRequest("PATCH", `/api/v1/expenses/${expenseId}`, {
        status: "approved"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/expenses"] });
      toast({
        title: "Expense Approved",
        description: "The expense has been approved successfully.",
      });
      triggerConfetti();
    },
  });

  const uploadReceiptMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploadProcessing(true);
      // Simulate file upload and AI processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const response = await apiRequest("POST", "/api/v1/upload", {
        filename: file.name,
        type: "receipt"
      });
      return response.json();
    },
    onSuccess: (data) => {
      setIsUploadProcessing(false);
      toast({
        title: "Receipt Processed!",
        description: `AI extracted: ${data.vendor} - $${data.amount}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/expenses"] });
    },
    onError: () => {
      setIsUploadProcessing(false);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to process receipt. Please try again.",
      });
    },
  });

  // Calculate statistics
  const thisMonthExpenses = (expenses || []).reduce((sum: number, exp: any) => 
    sum + parseFloat(exp.amount), 0);
  
  const pendingBills = (expenses || []).reduce((sum: number, exp: any) => 
    exp.status === "pending" ? sum + parseFloat(exp.amount) : sum, 0);
  
  const flaggedItems = (expenses || []).filter((exp: any) => exp.status === "flagged").length;

  const topCategory = (expenses || []).reduce((acc: any, exp: any) => {
    acc[exp.category] = (acc[exp.category] || 0) + parseFloat(exp.amount);
    return acc;
  }, {});
  
  const topCategoryName = topCategory ? Object.keys(topCategory).reduce((a, b) => 
    topCategory[a] > topCategory[b] ? a : b, "") : "";
  const topCategoryAmount = topCategory?.[topCategoryName] || 0;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadReceiptMutation.mutate(file);
    }
  };

  const handleApproveExpense = (expenseId: number) => {
    approveExpenseMutation.mutate(expenseId);
  };

  const filteredExpenses = (expenses || []).filter((expense: any) => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const overdueExpenses = (expenses || []).filter((exp: any) => 
    exp.dueDate && new Date(exp.dueDate) < new Date() && exp.status === "pending"
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Expenses & Bills"
          subtitle="Manage client expenses and track pending bills."
          actions={
            <Button className="btn-violet flex items-center space-x-2">
              <Receipt className="w-4 h-4" />
              <span>Add Expense</span>
            </Button>
          }
        />
        
        <div className="p-6">
          {/* Upload Zone */}
          <Card className="stat-card mb-6">
            <CardContent className="p-0">
              <div 
                className="border-2 border-dashed border-violet-300 rounded-xl p-8 text-center bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer m-6"
                onClick={() => document.getElementById('receipt-upload')?.click()}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-violet-200 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Upload Receipts & Bills</h3>
                    <p className="text-slate-600">Drag and drop files here, or click to browse</p>
                    <p className="text-sm text-slate-500 mt-1">Supports PDF, JPG, PNG, CSV files</p>
                  </div>
                  <Button className="btn-violet">
                    Choose Files
                  </Button>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Processing Alert */}
          {(isUploadProcessing || uploadReceiptMutation.isPending) && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="loading-spinner"></div>
                <div>
                  <p className="font-medium text-blue-800">AI Processing Receipt</p>
                  <p className="text-sm text-blue-700">Extracting data and categorizing expense...</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">This Month</p>
                    <p className="text-2xl font-bold text-slate-800">${thisMonthExpenses.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pending Bills</p>
                    <p className="text-2xl font-bold text-amber-600">${pendingBills.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Top Category</p>
                    <p className="text-lg font-bold text-slate-800">{topCategoryName}</p>
                    <p className="text-sm text-slate-500">${topCategoryAmount.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-violet-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Flagged Items</p>
                    <p className="text-2xl font-bold text-red-600">{flaggedItems}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Alerts */}
          {overdueExpenses.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-800">Overdue Bill Alert</h3>
                    <p className="text-sm text-red-700">
                      {overdueExpenses.length} bills are overdue. Total: ${overdueExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" className="bg-red-600 text-white hover:bg-red-700">
                    Review Bills
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* AI Optimization Suggestions */}
          <div className="mb-6 p-4 ai-suggestion">
            <div className="flex items-start">
              <Lightbulb className="w-5 h-5 text-blue-500 mt-1 mr-3" />
              <div>
                <h4 className="font-medium text-blue-800">AI Insights</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Office supplies expenses are 20% above average this month. Consider bulk purchasing for better rates.
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="stat-card mb-8">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Utilities">Utilities</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10"
                    />
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    {flaggedItems} Need Review
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card className="stat-card">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Recent Expenses</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm">
                    Batch Approve
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-slate-600">Loading expenses...</span>
                </div>
              ) : filteredExpenses.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No expenses found</p>
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
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Vendor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Amount
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
                      {filteredExpenses.map((expense: any) => (
                        <tr key={expense.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Checkbox />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                            {new Date(expense.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center mr-3">
                                <FileText className="w-4 h-4 text-slate-600" />
                              </div>
                              <span className="font-medium text-slate-800">{expense.vendor}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-slate-800">{expense.description}</span>
                            {expense.status === "flagged" && (
                              <div className="flex items-center mt-1">
                                <AlertTriangle className="w-3 h-3 text-red-500 mr-1" />
                                <span className="text-xs text-red-600">Duplicate detected</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant="secondary"
                              className={
                                expense.category === "Office Supplies" ? "bg-blue-100 text-blue-800" :
                                expense.category === "Travel" ? "bg-purple-100 text-purple-800" :
                                expense.category === "Software" ? "bg-green-100 text-green-800" :
                                "bg-slate-100 text-slate-800"
                              }
                            >
                              {expense.category}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">
                            ${parseFloat(expense.amount).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              variant={
                                expense.status === "approved" ? "default" :
                                expense.status === "flagged" ? "destructive" : "secondary"
                              }
                              className={
                                expense.status === "approved" ? "bg-green-100 text-green-800" :
                                expense.status === "flagged" ? "bg-red-100 text-red-800" : "bg-amber-100 text-amber-800"
                              }
                            >
                              {expense.status === "approved" ? "Approved" : 
                               expense.status === "flagged" ? "Flagged" : "Pending"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              {expense.status !== "approved" && (
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleApproveExpense(expense.id)}
                                  disabled={approveExpenseMutation.isPending}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                              {expense.receiptUrl && (
                                <Button variant="ghost" size="sm">
                                  <Receipt className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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
