import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Package, History, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CustomerRequestHistory from "@/components/customer/CustomerRequestHistory";
import CustomerNewRequest from "@/components/customer/CustomerNewRequest";
import CustomerSettings from "@/components/customer/CustomerSettings";
import { useQuery } from "@tanstack/react-query";
import { fetchCustomerDeliveries } from "@/services/customerService";

export default function CustomerPortal() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate("/customer-login");
    }
  }, [user, navigate]);
  
  // Fetch customer data
  const { data: deliveries, isLoading } = useQuery({
    queryKey: ["customerDeliveries", user?.id],
    queryFn: () => fetchCustomerDeliveries(user?.id as string),
    enabled: !!user?.id,
  });
  
  const pendingCount = deliveries?.filter(d => d.status === "pending").length || 0;
  const inProgressCount = deliveries?.filter(d => d.status === "in_progress").length || 0;
  const completedCount = deliveries?.filter(d => d.status === "completed").length || 0;
  
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="new-request">New Request</TabsTrigger>
              <TabsTrigger value="history">Request History</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Pending</CardTitle>
                  <CardDescription>Requests awaiting pickup</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? "..." : pendingCount}</div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => navigate("/customer-portal/pending")}
                  >
                    View all
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">In Progress</CardTitle>
                  <CardDescription>Deliveries in transit</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? "..." : inProgressCount}</div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => navigate("/customer-portal/in-progress")}
                  >
                    View all
                  </Button>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Completed</CardTitle>
                  <CardDescription>Past deliveries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{isLoading ? "..." : completedCount}</div>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-sm" 
                    onClick={() => navigate("/customer-portal/completed")}
                  >
                    View all
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <Button onClick={() => setActiveTab("new-request")} className="justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Delivery Request
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("history")} className="justify-start">
                    <History className="mr-2 h-4 w-4" />
                    View Delivery History
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/tracking")} className="justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    Track Current Delivery
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Recent Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <p>Loading recent delivery requests...</p>
                  ) : deliveries && deliveries.length > 0 ? (
                    <div className="space-y-4">
                      {deliveries.slice(0, 3).map((delivery) => (
                        <div key={delivery.id} className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{delivery.id}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(delivery.created_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium
                              ${delivery.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                              ${delivery.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                              ${delivery.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            `}>
                              {delivery.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <Button variant="link" className="p-0" onClick={() => setActiveTab("history")}>
                        View all delivery requests
                      </Button>
                    </div>
                  ) : (
                    <p>No recent delivery requests found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="new-request">
            <Card>
              <CardHeader>
                <CardTitle>Create New Delivery Request</CardTitle>
                <CardDescription>Fill out the form to request a new medical delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerNewRequest />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>View and manage your past delivery requests</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerRequestHistory />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <CustomerSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 