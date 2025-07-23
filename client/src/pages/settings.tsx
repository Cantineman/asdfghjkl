import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AiChat from "@/components/common/ai-chat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings as SettingsIcon, 
  Link, 
  MessageSquare, 
  User, 
  Save,
  Shield,
  CheckCircle,
  AlertCircle,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { useConfetti } from "@/hooks/use-confetti";

type SettingsTab = "preferences" | "integrations" | "support" | "account";

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("preferences");
  const [settings, setSettings] = useState({
    aiAlerts: true,
    autoCategorize: true,
    smartReminders: false,
    emailNotifications: true,
    weeklyReports: true,
    theme: "light",
    dateFormat: "MM/DD/YYYY",
    currency: "USD",
    sessionTimeout: "1_hour"
  });
  const [gustoApiKey, setGustoApiKey] = useState("");
  const { toast } = useToast();
  const { triggerConfetti } = useConfetti();
  const queryClient = useQueryClient();

  const { data: integrations } = useQuery({
    queryKey: ["/api/v1/integrations", "1"], // Mock client ID
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: typeof settings) => {
      const response = await apiRequest("PATCH", "/api/v1/settings", updatedSettings);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings Saved!",
        description: "Your preferences have been updated successfully.",
      });
      triggerConfetti();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save settings. Please try again.",
      });
    },
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (data: { type: string; apiKey: string }) => {
      const response = await apiRequest("POST", "/api/v1/integrations/test", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Connection Successful!",
        description: data.message,
      });
      triggerConfetti();
      queryClient.invalidateQueries({ queryKey: ["/api/v1/integrations"] });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: "Invalid credentials. Please check and try again.",
      });
    },
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate(settings);
  };

  const handleReconnectGusto = () => {
    if (!gustoApiKey) {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please enter your Gusto API key.",
      });
      return;
    }
    testConnectionMutation.mutate({ type: "gusto", apiKey: gustoApiKey });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "preferences":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">General Preferences</h3>
            
            {/* AI Settings */}
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-slate-800">AI Automation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Enable AI Alerts</p>
                    <p className="text-sm text-slate-500">Get smart notifications about anomalies and opportunities</p>
                  </div>
                  <Switch
                    checked={settings.aiAlerts}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, aiAlerts: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Auto-categorize Expenses</p>
                    <p className="text-sm text-slate-500">Automatically categorize uploaded receipts and bills</p>
                  </div>
                  <Switch
                    checked={settings.autoCategorize}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, autoCategorize: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Smart Invoice Reminders</p>
                    <p className="text-sm text-slate-500">AI-powered timing for payment reminders</p>
                  </div>
                  <Switch
                    checked={settings.smartReminders}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smartReminders: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-slate-800">Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-700">Email Notifications</p>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="font-medium text-slate-700">Weekly Reports</p>
                  <Switch
                    checked={settings.weeklyReports}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, weeklyReports: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Display Settings */}
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-slate-800">Display & Interface</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Theme</Label>
                  <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                    <SelectTrigger className="form-select mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">Date Format</Label>
                  <Select value={settings.dateFormat} onValueChange={(value) => setSettings(prev => ({ ...prev, dateFormat: value }))}>
                    <SelectTrigger className="form-select mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-700">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger className="form-select mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-slate-800">Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                  </div>
                  <Button className="btn-violet">
                    Enable
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-700">Session Timeout</p>
                    <p className="text-sm text-slate-500">Automatically log out after inactivity</p>
                  </div>
                  <Select value={settings.sessionTimeout} onValueChange={(value) => setSettings(prev => ({ ...prev, sessionTimeout: value }))}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30_min">30 minutes</SelectItem>
                      <SelectItem value="1_hour">1 hour</SelectItem>
                      <SelectItem value="4_hours">4 hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="pt-6">
              <Button 
                onClick={handleSaveSettings}
                disabled={saveSettingsMutation.isPending}
                className="btn-violet flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saveSettingsMutation.isPending ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Connected Services</h3>
            
            <div className="space-y-4">
              {/* Gusto Integration */}
              <Card className="border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Gusto</h4>
                        <p className="text-sm text-slate-500">Payroll management integration</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="badge-connected">
                        Connected
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleReconnectGusto}
                        disabled={testConnectionMutation.isPending}
                      >
                        Reconnect
                      </Button>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Input
                      placeholder="Enter new API key to reconnect"
                      value={gustoApiKey}
                      onChange={(e) => setGustoApiKey(e.target.value)}
                      type="password"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Plaid Integration */}
              <Card className="border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Plaid</h4>
                        <p className="text-sm text-slate-500">Bank account connections</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="badge-connected">
                        Connected
                      </Badge>
                      <Button variant="outline" size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe Integration */}
              <Card className="border border-slate-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Link className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-800">Stripe</h4>
                        <p className="text-sm text-slate-500">Payment processing</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className="badge-disconnected">
                        Not Connected
                      </Badge>
                      <Button variant="outline" size="sm">
                        Connect
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "support":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">AI Support Chat</h3>
            <p className="text-slate-600">Get instant help with your accounting questions</p>
            
            <Card className="border border-slate-200 h-96">
              <CardContent className="h-full p-0">
                <div className="h-full">
                  <AiChat fullScreen />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">Account Settings</h3>
            
            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-slate-800">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Full Name</Label>
                  <Input className="form-input mt-2" defaultValue="John Accountant" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Email Address</Label>
                  <Input className="form-input mt-2" defaultValue="accountant@example.com" type="email" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Company</Label>
                  <Input className="form-input mt-2" defaultValue="Professional Accounting Services" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-slate-800">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Current Password</Label>
                  <Input className="form-input mt-2" type="password" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">New Password</Label>
                  <Input className="form-input mt-2" type="password" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Confirm New Password</Label>
                  <Input className="form-input mt-2" type="password" />
                </div>
                <Button className="btn-violet">
                  Update Password
                </Button>
              </CardContent>
            </Card>

            <Card className="border border-red-200">
              <CardHeader>
                <CardTitle className="text-base font-medium text-red-800">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-700">Delete Account</p>
                    <p className="text-sm text-red-600">Permanently delete your account and all associated data</p>
                  </div>
                  <Button variant="destructive">
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
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
        <Header title="Settings & Support" />
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Settings Tabs */}
            <div className="lg:col-span-1">
              <Card className="stat-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-slate-800">Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <nav className="space-y-2">
                    <button 
                      onClick={() => setActiveTab("preferences")}
                      className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                        activeTab === "preferences" 
                          ? "bg-violet-50 text-violet-700 font-medium" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <SettingsIcon className="w-4 h-4" />
                      <span>Preferences</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab("integrations")}
                      className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                        activeTab === "integrations" 
                          ? "bg-violet-50 text-violet-700 font-medium" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Link className="w-4 h-4" />
                      <span>Integrations</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab("support")}
                      className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                        activeTab === "support" 
                          ? "bg-violet-50 text-violet-700 font-medium" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>AI Support</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab("account")}
                      className={`w-full text-left px-4 py-2 rounded-lg flex items-center space-x-3 transition-colors ${
                        activeTab === "account" 
                          ? "bg-violet-50 text-violet-700 font-medium" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Account</span>
                    </button>
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-2">
              <Card className="stat-card">
                <CardContent className="p-6">
                  {renderTabContent()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
