
import React, { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LogOut, 
  User, 
  Truck, 
  MapPin, 
  Clock,
  Package,
  FileText,
  Camera,
  Shield,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import DriverLocationTracker from './DriverLocation';
import DeliveryTracker from './DeliveryTracker';
import FileStorage from './FileStorage';
import AdvancedSecurity from './AdvancedSecurity';

interface DriverDashboardMainProps {
  user: any;
}

const DriverDashboardMain: React.FC<DriverDashboardMainProps> = ({ user }) => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const driverStats = {
    totalDeliveries: 45,
    completedToday: 8,
    averageRating: 4.8,
    totalEarnings: 2340
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/lovable-uploads/2cc5b47e-c0a1-4e3c-91b8-6bb24e0b8f97.png" 
                alt="Catalyst Network" 
                className="h-8 w-auto mr-3"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <h1 className="text-xl font-semibold text-gray-900">Driver Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.user_metadata?.name || user?.email}
              </span>
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="deliveries" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Deliveries
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{driverStats.totalDeliveries}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Deliveries</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{driverStats.completedToday}</div>
                  <p className="text-xs text-muted-foreground">+2 from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                  <User className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{driverStats.averageRating}/5</div>
                  <p className="text-xs text-muted-foreground">Based on 45 reviews</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${driverStats.totalEarnings}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  className="h-16 flex-col gap-2"
                  onClick={() => setActiveTab('deliveries')}
                >
                  <Package className="h-5 w-5" />
                  View Deliveries
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => setActiveTab('location')}
                >
                  <MapPin className="h-5 w-5" />
                  Share Location
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => setActiveTab('files')}
                >
                  <Camera className="h-5 w-5" />
                  Upload Photos
                </Button>
                <Button 
                  variant="outline" 
                  className="h-16 flex-col gap-2"
                  onClick={() => setActiveTab('security')}
                >
                  <Shield className="h-5 w-5" />
                  Security
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="deliveries">
            <DeliveryTracker driverId={user?.id} />
          </TabsContent>

          <TabsContent value="location">
            <DriverLocationTracker driverId={user?.id} />
          </TabsContent>

          <TabsContent value="files">
            <FileStorage driverId={user?.id} />
          </TabsContent>

          <TabsContent value="security">
            <AdvancedSecurity driverId={user?.id} />
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Detailed analytics coming soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default DriverDashboardMain;
