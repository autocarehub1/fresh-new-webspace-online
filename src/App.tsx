
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import RequestPickup from "./pages/RequestPickup";
import Tracking from "./pages/Tracking";
import Services from "./pages/Services";
import ServiceDetails from "./pages/ServiceDetails";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { AuthProvider } from "./lib/auth";
import DriverDashboard from "./pages/DriverDashboard";
import QueryParamHandler from "./components/tracking/QueryParamHandler";
import AutoDispatchIndicator from "./components/dispatch/AutoDispatchIndicator";
import CustomerPortal from "./pages/CustomerPortal";
import CustomerLogin from "./pages/CustomerLogin";
import Compliance from "./pages/Compliance";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DriverAuth from "./pages/DriverAuth";
import DriverOnboarding from "./pages/DriverOnboarding";
import AuthCallback from "./pages/auth/callback";
import DriverProfileSetup from "./pages/DriverProfileSetup";
import DebugSupabase from "./pages/DebugSupabase";
import { ProtectedRoute, CustomerRoute } from "./components/auth/ProtectedRoutes";

// Redirect component for legacy URLs
const AdminRequestRedirect = () => {
  const requestId = window.location.pathname.split('/').pop();
  console.log("Redirecting legacy URL to tracking page, request ID:", requestId);
  return <Navigate to={`/tracking?id=${requestId}`} replace />;
};

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <QueryParamHandler />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/request-pickup" element={<RequestPickup />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:serviceType" element={<ServiceDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/compliance" element={<Compliance />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/customer-login" element={<CustomerLogin />} />
              <Route path="/driver-auth" element={<DriverAuth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/debug-supabase" element={<DebugSupabase />} />
              
              {/* Protected routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              } />
              <Route path="/driver/:driverId" element={
                <ProtectedRoute>
                  <DriverDashboard />
                </ProtectedRoute>
              } />
              <Route path="/driver-onboarding" element={
                <ProtectedRoute>
                  <DriverOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/driver-profile-setup" element={
                <ProtectedRoute>
                  <DriverProfileSetup />
                </ProtectedRoute>
              } />
              
              {/* Customer portal routes */}
              <Route path="/customer-portal" element={
                <CustomerRoute>
                  <CustomerPortal />
                </CustomerRoute>
              } />
              <Route path="/customer-portal/:tabId" element={
                <CustomerRoute>
                  <CustomerPortal />
                </CustomerRoute>
              } />
              
              {/* Legacy URL redirect */}
              <Route path="/admin/requests/:requestId" element={<AdminRequestRedirect />} />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global components */}
            <Toaster />
            <Sonner />
            <AutoDispatchIndicator />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
