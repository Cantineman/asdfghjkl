import { Router, Route, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import Invoicing from "@/pages/invoicing";
import Expenses from "@/pages/expenses";
import Payroll from "@/pages/payroll";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

// Simple auth check - in production this would be more robust
const isAuthenticated = () => {
  return localStorage.getItem("authToken") !== null;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isAuthenticated() && location !== "/login") {
      setLocation("/login");
    }
  }, [location, setLocation]);

  return isAuthenticated() ? <>{children}</> : null;
};

const RedirectToLogin = () => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation("/login");
  }, [setLocation]);
  
  return null;
};

const RedirectToDashboard = () => {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    setLocation("/dashboard");
  }, [setLocation]);
  
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
          <Route path="/login" component={Login} />
          <Route path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route path="/onboarding">
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          </Route>
          <Route path="/invoicing">
            <ProtectedRoute>
              <Invoicing />
            </ProtectedRoute>
          </Route>
          <Route path="/expenses">
            <ProtectedRoute>
              <Expenses />
            </ProtectedRoute>
          </Route>
          <Route path="/payroll">
            <ProtectedRoute>
              <Payroll />
            </ProtectedRoute>
          </Route>
          <Route path="/reports">
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          </Route>
          <Route path="/settings">
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </Route>
          <Route path="/" component={RedirectToDashboard} />
          <Route component={NotFound} />
          <Toaster />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
