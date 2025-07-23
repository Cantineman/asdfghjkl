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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play,
  Search, 
  Download, 
  Eye, 
  Edit,
  UserPlus,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileText,
  MoreHorizontal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useConfetti } from "@/hooks/use-confetti";

export default function Payroll() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  const { triggerConfetti } = useConfetti();
  const queryClient = useQueryClient();

  const { data: clients } = useQuery({
    queryKey: ["/api/v1/clients"],
  });

  const { data: employees, isLoading } = useQuery({
    queryKey: ["/api/v1/employees"],
  });

  const runPayrollMutation = useMutation({
    mutationFn: async (clientId?: number) => {
      const response = await apiRequest("POST", "/api/v1/payroll/run", {
        clientId,
        period: "current"
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payroll Processed!",
        description: "Payroll has been successfully processed for all employees.",
      });
      triggerConfetti();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/employees"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Payroll Failed",
        description: "Failed to process payroll. Please try again.",
      });
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: any }) => {
      const response = await apiRequest("PATCH", `/api/v1/employees/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/v1/employees"] });
      toast({
        title: "Employee Updated",
        description: "Employee information has been updated successfully.",
      });
    },
  });

  // Calculate statistics
  const totalEmployees = (employees || []).length;
  const monthlyPayroll = (employees || []).reduce((sum: number, emp: any) => 
    sum + parseFloat(emp.grossPay), 0);
  
  const employeesByClient = (employees || []).reduce((acc: any, emp: any) => {
    const client = (clients || []).find((c: any) => c.id === emp.clientId);
    const clientName = client?.name || 'Unknown';
    acc[clientName] = (acc[clientName] || 0) + 1;
    return acc;
  }, {});

  const nextPayrollDate = new Date();
  nextPayrollDate.setDate(nextPayrollDate.getDate() + 5);

  const handleRunPayroll = () => {
    const selectedClientId = clientFilter === "all" ? undefined : parseInt(clientFilter);
    runPayrollMutation.mutate(selectedClientId);
  };

  const filteredEmployees = (employees || []).filter((employee: any) => {
    const client = (clients || []).find((c: any) => c.id === employee.clientId);
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClient = clientFilter === "all" || employee.clientId.toString() === clientFilter;
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter;
    const matchesTab = activeTab === "all" || 
                      (activeTab === client?.name.toLowerCase().replace(/\s+/g, ''));
    
    return matchesSearch && matchesClient && matchesDepartment && matchesTab;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Payroll Management"
          subtitle="Process payroll and manage employee information across all clients."
          actions={
            <Button 
              onClick={handleRunPayroll}
              disabled={runPayrollMutation.isPending}
              className="btn-violet flex items-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>{runPayrollMutation.isPending ? "Processing..." : "Run Payroll"}</span>
            </Button>
          }
        />
        
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Next Payroll Run</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {nextPayrollDate.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-slate-500">5 days remaining</p>
                  </div>
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Employees</p>
                    <p className="text-2xl font-bold text-slate-800">{totalEmployees}</p>
                    <p className="text-sm text-green-600">+3 this month</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="stat-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Monthly Payroll</p>
                    <p className="text-2xl font-bold text-slate-800">${monthlyPayroll.toLocaleString()}</p>
                    <p className="text-sm text-slate-500">Across all clients</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Forecast */}
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800">AI Payroll Forecast</h3>
                  <p className="text-sm text-slate-600">
                    Next liability payment: ${(monthlyPayroll * 0.35).toLocaleString()} due {nextPayrollDate.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                View Breakdown →
              </Button>
            </div>
          </div>

          {/* Client Tabs */}
          <Card className="stat-card mb-8">
            <div className="border-b border-slate-200">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start p-0 bg-transparent">
                  <TabsTrigger 
                    value="all" 
                    className="border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:text-violet-600 rounded-none"
                  >
                    All Clients ({totalEmployees})
                  </TabsTrigger>
                  {Object.keys(employeesByClient).map((clientName) => (
                    <TabsTrigger 
                      key={clientName}
                      value={clientName.toLowerCase().replace(/\s+/g, '')}
                      className="border-b-2 border-transparent data-[state=active]:border-violet-500 data-[state=active]:text-violet-600 rounded-none"
                    >
                      {clientName} ({employeesByClient[clientName]})
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Filters */}
            <CardContent className="p-6 border-b border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Select value={clientFilter} onValueChange={setClientFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Current Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Period</SelectItem>
                      <SelectItem value="previous">Previous Period</SelectItem>
                      <SelectItem value="ytd">YTD</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64 pl-10"
                    />
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Employee
                  </Button>
                </div>
              </div>
            </CardContent>

            {/* Employee Table */}
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner"></div>
                  <span className="ml-2 text-slate-600">Loading employees...</span>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p>No employees found</p>
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
                          Employee
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Gross Pay
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                          Net Pay
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
                      {filteredEmployees.map((employee: any) => {
                        const client = clients?.find((c: any) => c.id === employee.clientId);
                        
                        return (
                          <tr key={employee.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Checkbox />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-violet-100 rounded-full flex items-center justify-center mr-4">
                                  <span className="text-sm font-medium text-violet-600">
                                    {employee.name.split(' ').map((n: string) => n[0]).join('')}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{employee.name}</div>
                                  <div className="text-sm text-slate-500">{employee.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-900">{client?.name || 'Unknown'}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-slate-900">{employee.department}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              ${parseFloat(employee.grossPay).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                              ${parseFloat(employee.netPay).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge 
                                variant={employee.status === "active" ? "default" : "secondary"}
                                className={
                                  employee.status === "active" ? "bg-green-100 text-green-800" : 
                                  "bg-slate-100 text-slate-600"
                                }
                              >
                                {employee.status === "active" ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm">
                                  <FileText className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
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
