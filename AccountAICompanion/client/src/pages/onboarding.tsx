import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Link as LinkIcon, 
  Upload, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Lightbulb,
  AlertCircle,
  Shield,
  CreditCard
} from "lucide-react";
import { insertClientSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useConfetti } from "@/hooks/use-confetti";
import { apiRequest } from "@/lib/api";
import { z } from "zod";

type Step = 1 | 2 | 3 | 4;

const clientFormSchema = insertClientSchema.extend({
  gustoApiKey: z.string().optional(),
});

type ClientForm = z.infer<typeof clientFormSchema>;

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [gustoConnected, setGustoConnected] = useState(false);
  const [plaidConnected, setPlaidConnected] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { triggerConfetti } = useConfetti();
  const queryClient = useQueryClient();

  const form = useForm<ClientForm>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      businessType: "",
      taxId: "",
      industry: "",
      email: "",
      phone: "",
      address: "",
      gustoApiKey: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientForm) => {
      const { gustoApiKey, ...clientData } = data;
      const response = await apiRequest("POST", "/api/v1/clients", clientData);
      return response.json();
    },
    onSuccess: () => {
      triggerConfetti();
      toast({
        title: "Client Created Successfully!",
        description: "Your new client has been set up and is ready to go.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/v1/clients"] });
      setLocation("/dashboard");
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create client. Please try again.",
      });
    },
  });

  const testGustoMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      const response = await apiRequest("POST", "/api/v1/integrations/test", {
        type: "gusto",
        apiKey,
      });
      return response.json();
    },
    onSuccess: () => {
      setGustoConnected(true);
      toast({
        title: "Gusto Connected!",
        description: "Your Gusto integration is now active.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Invalid Gusto API key. Please check and try again.",
      });
    },
  });

  const steps = [
    { number: 1, title: "Client Information", icon: Building },
    { number: 2, title: "Integrations", icon: LinkIcon },
    { number: 3, title: "Data Upload", icon: Upload },
    { number: 4, title: "Review", icon: CheckCircle },
  ];

  const progressPercentage = (currentStep / 4) * 100;

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleTestGusto = () => {
    const apiKey = form.getValues("gustoApiKey");
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please enter your Gusto API key.",
      });
      return;
    }
    testGustoMutation.mutate(apiKey);
  };

  const handleConnectPlaid = () => {
    // Simulate Plaid OAuth flow
    setTimeout(() => {
      setPlaidConnected(true);
      toast({
        title: "Bank Connected!",
        description: "Chase Business Checking account linked successfully.",
      });
    }, 1000);
  };

  const handleConnectStripe = () => {
    // Simulate Stripe OAuth flow
    setTimeout(() => {
      setStripeConnected(true);
      toast({
        title: "Stripe Connected!",
        description: "Payment processing integration active.",
      });
    }, 1000);
  };

  const handleFinish = () => {
    const formData = form.getValues();
    createClientMutation.mutate(formData);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-2xl mb-4">
                <Building className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Client Information</h2>
              <p className="text-slate-600">Let's start with the basics about your new client.</p>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <Label className="text-sm font-medium text-slate-700">Business Name *</Label>
                <Input
                  className="form-input mt-2"
                  placeholder="Enter business name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="error-text">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Business Type *</Label>
                  <Select onValueChange={(value) => form.setValue("businessType", value)}>
                    <SelectTrigger className="form-select mt-2">
                      <SelectValue placeholder="Select business type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LLC">LLC</SelectItem>
                      <SelectItem value="Corporation">Corporation</SelectItem>
                      <SelectItem value="Partnership">Partnership</SelectItem>
                      <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-700">Tax ID (EIN)</Label>
                  <Input
                    className="form-input mt-2"
                    placeholder="XX-XXXXXXX"
                    {...form.register("taxId")}
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-slate-700">Industry</Label>
                <Select onValueChange={(value) => form.setValue("industry", value)}>
                  <SelectTrigger className="form-select mt-2">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Professional Services">Professional Services</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="ai-suggestion">
                <div className="flex items-start">
                  <Lightbulb className="w-5 h-5 text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">AI Suggestion</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on the business name, this appears to be a technology company. 
                      I've pre-selected relevant industry settings.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-4">
                <LinkIcon className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Connect Integrations</h2>
              <p className="text-slate-600">Link your client's financial accounts and services.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {/* Plaid Integration */}
              <Card className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Plaid</h3>
                        <p className="text-sm text-slate-600">Bank connections</p>
                      </div>
                    </div>
                    {plaidConnected ? (
                      <Badge className="badge-connected">Connected</Badge>
                    ) : (
                      <Button onClick={handleConnectPlaid} className="btn-violet">
                        Connect Bank
                      </Button>
                    )}
                  </div>
                  {plaidConnected && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-800">Connected! Chase Business Checking</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Stripe Integration */}
              <Card className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Stripe</h3>
                        <p className="text-sm text-slate-600">Payment processing</p>
                      </div>
                    </div>
                    {stripeConnected ? (
                      <Badge className="badge-connected">Connected</Badge>
                    ) : (
                      <Button variant="outline" onClick={handleConnectStripe}>
                        Connect Stripe
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Gusto Integration */}
              <Card className="border border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Building className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-800">Gusto</h3>
                        <p className="text-sm text-slate-600">Payroll management</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-slate-700">Gusto API Key</Label>
                      <div className="flex space-x-2 mt-2">
                        <Input
                          type="password"
                          placeholder="Enter your Gusto API key"
                          className="form-input flex-1"
                          {...form.register("gustoApiKey")}
                        />
                        <Button 
                          onClick={handleTestGusto}
                          disabled={testGustoMutation.isPending}
                          className="btn-violet"
                        >
                          {testGustoMutation.isPending ? "Testing..." : "Test"}
                        </Button>
                      </div>
                    </div>
                    {gustoConnected && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-800">Connected! 10 employees synced successfully</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-2xl mb-4">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Upload Initial Data</h2>
              <p className="text-slate-600">Import existing financial data to get started quickly.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-violet-300 rounded-2xl p-12 text-center bg-violet-50 hover:bg-violet-100 transition-colors cursor-pointer">
                <div className="max-w-sm mx-auto">
                  <Upload className="w-16 h-16 text-violet-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-800 mb-2">Drop files here or click to browse</h3>
                  <p className="text-sm text-slate-600 mb-4">Support for CSV files, PDFs, and common formats</p>
                  <Button className="btn-violet">
                    Choose Files
                  </Button>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-slate-800">customers.csv</p>
                      <p className="text-sm text-slate-600">15 customers imported</p>
                    </div>
                  </div>
                  <Badge className="badge-connected">Processed</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center">
                    <div className="loading-spinner mr-3"></div>
                    <div>
                      <p className="font-medium text-slate-800">vendors.csv</p>
                      <p className="text-sm text-slate-600">Processing...</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Processing</Badge>
                </div>
              </div>

              {/* AI Processing Status */}
              <div className="ai-suggestion">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-1 mr-3" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">AI Processing</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Analyzing uploaded data and categorizing transactions automatically...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-violet-100 rounded-2xl mb-4">
                <CheckCircle className="w-8 h-8 text-violet-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-800 mb-2">Review & Confirm</h2>
              <p className="text-slate-600">Everything looks good! Review the setup before finishing.</p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="stat-card">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-800">Client Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Business Name:</span>
                      <span className="text-slate-800">{form.watch("name") || "TechFlow Solutions"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Type:</span>
                      <span className="text-slate-800">{form.watch("businessType") || "LLC"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Industry:</span>
                      <span className="text-slate-800">{form.watch("industry") || "Technology"}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="stat-card">
                  <CardHeader>
                    <CardTitle className="text-base font-medium text-slate-800">Connected Services</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-slate-800">Chase Business Checking</span>
                    </div>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                      <span className="text-slate-800">Gusto Payroll (10 employees)</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-slate-400 mr-2" />
                      <span className="text-slate-500">Stripe (Optional)</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Summary */}
              <Card className="stat-card">
                <CardHeader>
                  <CardTitle className="text-base font-medium text-slate-800">Imported Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-violet-600">15</div>
                      <div className="text-sm text-slate-600">Customers</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">8</div>
                      <div className="text-sm text-slate-600">Vendors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">23</div>
                      <div className="text-sm text-slate-600">Transactions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header title="Add New Client" />
        
        <div className="p-6">
          {/* Progress Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-semibold text-slate-800">Client Onboarding</h1>
              <span className="text-sm text-slate-600">Step {currentStep} of 4</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {steps.map((step) => (
                <div key={step.number} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? "bg-violet-600 text-white" 
                      : "bg-slate-200 text-slate-600"
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`ml-2 text-sm ${
                    currentStep >= step.number ? "text-slate-800" : "text-slate-500"
                  }`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <Card className="max-w-4xl mx-auto stat-card">
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
            
            {/* Navigation Footer */}
            <div className="bg-slate-50 px-8 py-4 flex justify-between items-center">
              <Button 
                variant="outline" 
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>
              
              <div className="flex space-x-3">
                <Button variant="outline">
                  Skip Step
                </Button>
                {currentStep < 4 ? (
                  <Button onClick={nextStep} className="btn-violet flex items-center space-x-2">
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleFinish}
                    disabled={createClientMutation.isPending}
                    className="btn-violet flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{createClientMutation.isPending ? "Creating..." : "Finish Setup"}</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
