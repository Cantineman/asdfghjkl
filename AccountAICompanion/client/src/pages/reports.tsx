import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { BarChart, Plus, Download, Share, ArrowRight, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useConfetti } from "@/hooks/use-confetti";

export default function Reports() {
  const [reportConfig, setReportConfig] = useState({
    type: "profit_loss",
    clientId: "",
    dateRange: "this_month",
    format: "pdf",
    includeAiAnalysis: true,
    includeTrends: true,
    includeBenchmarks: false
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { triggerConfetti } = useConfetti();

  const { data: clients } = useQuery({
    queryKey: ["/api/v1/clients"],
  });

  const { data: reports } = useQuery({
    queryKey: ["/api/v1/reports"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (config: typeof reportConfig) => {
      const response = await apiRequest("POST", "/api/v1/reports/generate", {
        type: config.type,
        clientId: config.clientId ? parseInt(config.clientId) : null,
        dateRange: {
          period: config.dateRange,
          start: new Date().toISOString(),
          end: new Date().toISOString()
        }
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Report Generated!",
        description: "Your AI-powered report is ready for download.",
      });
      triggerConfetti();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
      });
    },
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      await generateReportMutation.mutateAsync(reportConfig);
    } finally {
      setIsGenerating(false);
    }
  };

  // Sample report data for preview
  const sampleReportData = {
    title: "Acme Corp",
    subtitle: "Profit & Loss Statement",
    period: "January 1 - January 31, 2024",
    revenue: {
      productSales: "85,400",
      serviceRevenue: "24,600",
      total: "110,000"
    },
    expenses: {
      cogs: "45,200",
      operating: "32,800",
      total: "78,000"
    },
    netProfit: "32,000",
    profitMargin: "29.1",
    aiInsights: [
      "Revenue increased 12% compared to last month - great momentum!",
      "Operating expenses are 5% above industry average - consider cost optimization",
      "Profit margin improved by 3.2% - excellent progress",
      "Recommend setting aside $8,000 for quarterly tax payment"
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Reports & Analytics"
          subtitle="Generate comprehensive financial reports with AI insights."
          actions={
            <Button 
              className="btn-violet flex items-center space-x-2"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              <BarChart className="w-4 h-4" />
              <span>{isGenerating ? "Generating..." : "Generate Report"}</span>
            </Button>
          }
        />
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Configuration */}
            <div className="lg:col-span-2">
              <Card className="stat-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Report Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Report Type</Label>
                      <Select 
                        value={reportConfig.type} 
                        onValueChange={(value) => setReportConfig(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger className="form-select mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="profit_loss">Profit & Loss</SelectItem>
                          <SelectItem value="balance_sheet">Balance Sheet</SelectItem>
                          <SelectItem value="cash_flow">Cash Flow Statement</SelectItem>
                          <SelectItem value="tax_summary">Tax Summary</SelectItem>
                          <SelectItem value="custom">Custom Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Client</Label>
                      <Select 
                        value={reportConfig.clientId} 
                        onValueChange={(value) => setReportConfig(prev => ({ ...prev, clientId: value }))}
                      >
                        <SelectTrigger className="form-select mt-2">
                          <SelectValue placeholder="All Clients" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Clients</SelectItem>
                          {(clients || []).map((client: any) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Date Range</Label>
                      <Select 
                        value={reportConfig.dateRange} 
                        onValueChange={(value) => setReportConfig(prev => ({ ...prev, dateRange: value }))}
                      >
                        <SelectTrigger className="form-select mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="this_month">This Month</SelectItem>
                          <SelectItem value="last_month">Last Month</SelectItem>
                          <SelectItem value="this_quarter">This Quarter</SelectItem>
                          <SelectItem value="this_year">This Year</SelectItem>
                          <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Format</Label>
                      <Select 
                        value={reportConfig.format} 
                        onValueChange={(value) => setReportConfig(prev => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger className="form-select mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* AI Analysis Options */}
                  <div className="ai-suggestion">
                    <div className="flex items-start">
                      <TrendingUp className="w-5 h-5 text-blue-500 mt-1 mr-3" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-blue-800 mb-3">AI Analysis Options</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="trends"
                              checked={reportConfig.includeTrends}
                              onCheckedChange={(checked) => 
                                setReportConfig(prev => ({ ...prev, includeTrends: !!checked }))
                              }
                            />
                            <Label htmlFor="trends" className="text-sm text-blue-700">
                              Include trend analysis
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="insights"
                              checked={reportConfig.includeAiAnalysis}
                              onCheckedChange={(checked) => 
                                setReportConfig(prev => ({ ...prev, includeAiAnalysis: !!checked }))
                              }
                            />
                            <Label htmlFor="insights" className="text-sm text-blue-700">
                              Generate insights and recommendations
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="benchmarks"
                              checked={reportConfig.includeBenchmarks}
                              onCheckedChange={(checked) => 
                                setReportConfig(prev => ({ ...prev, includeBenchmarks: !!checked }))
                              }
                            />
                            <Label htmlFor="benchmarks" className="text-sm text-blue-700">
                              Compare to industry benchmarks
                            </Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerateReport}
                    disabled={isGenerating}
                    className="w-full btn-violet"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    {isGenerating ? "Generating Report with AI Analysis..." : "Generate Report with AI Analysis"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Reports & Recent */}
            <div className="space-y-6">
              <Card className="stat-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Quick Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <button className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">Monthly P&L</p>
                        <p className="text-sm text-slate-600">Current month summary</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                  <button className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">Cash Flow</p>
                        <p className="text-sm text-slate-600">30-day projection</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                  <button className="w-full text-left p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-800">Tax Summary</p>
                        <p className="text-sm text-slate-600">Quarterly overview</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                </CardContent>
              </Card>

              <Card className="stat-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(reports || []).slice(0, 3).map((report: any) => (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-800">{report.title}</p>
                        <p className="text-sm text-slate-600">
                          Generated {new Date(report.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {(!reports || reports.length === 0) && (
                    <div className="text-center py-4 text-slate-500">
                      <p>No recent reports</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Report Preview */}
          <Card className="stat-card mt-8">
            <CardHeader className="border-b border-slate-200">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-800">Report Preview</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Share className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" className="bg-violet-100 text-violet-700 hover:bg-violet-200">
                    <Download className="w-4 h-4 mr-1" />
                    Export PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* Sample P&L Report */}
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">{sampleReportData.title}</h2>
                <h3 className="text-lg text-slate-600">{sampleReportData.subtitle}</h3>
                <p className="text-sm text-slate-500">{sampleReportData.period}</p>
              </div>

              {/* Financial Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                    Revenue
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Product Sales</span>
                      <span className="font-medium text-slate-800">${sampleReportData.revenue.productSales}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Service Revenue</span>
                      <span className="font-medium text-slate-800">${sampleReportData.revenue.serviceRevenue}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="font-semibold text-slate-800">Total Revenue</span>
                      <span className="font-bold text-green-600">${sampleReportData.revenue.total}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-800 mb-4 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-red-600" />
                    Expenses
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cost of Goods Sold</span>
                      <span className="font-medium text-slate-800">${sampleReportData.expenses.cogs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Operating Expenses</span>
                      <span className="font-medium text-slate-800">${sampleReportData.expenses.operating}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2">
                      <span className="font-semibold text-slate-800">Total Expenses</span>
                      <span className="font-bold text-red-600">${sampleReportData.expenses.total}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Profit */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-green-800">Net Profit</h4>
                    <p className="text-sm text-green-600">Profit margin: {sampleReportData.profitMargin}%</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-green-700">${sampleReportData.netProfit}</span>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="ai-suggestion">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-1 mr-3" />
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">AI Insights & Recommendations</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      {sampleReportData.aiInsights.map((insight, index) => (
                        <li key={index}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
