import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import DriverLocationTracker from '@/components/driver/DriverLocation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';

const DriverDashboard = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        if (!driverId) {
          toast.error("Driver ID not provided");
          return;
        }
        
        setLoading(true);
        
        // Fetch driver details
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', driverId)
          .single();
          
        if (driverError) {
          console.error('Error fetching driver:', driverError);
          toast.error("Could not load driver information");
          return;
        }
        
        setDriver(driverData);
        
        // Get driver's current assigned delivery
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('delivery_requests')
          .select('*')
          .eq('assigned_driver', driverId)
          .in('status', ['pending', 'in_progress'])
          .single();
          
        if (!deliveryError && deliveryData) {
          console.log('Current delivery found:', deliveryData);
          setCurrentDelivery(deliveryData);
        } else if (deliveryError && deliveryError.code !== 'PGRST116') {
          // PGRST116 is the error code for "no rows returned"
          console.error('Error fetching delivery:', deliveryError);
        }
      } catch (err) {
        console.error('Error in fetchDriverData:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDriverData();
    
    // Set up real-time subscription to delivery changes
    const deliverySubscription = supabase
      .channel('driver-deliveries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'delivery_requests',
        filter: `assigned_driver=eq.${driverId}`
      }, (payload) => {
        console.log('Delivery update received:', payload);
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setCurrentDelivery(payload.new);
        } else if (payload.eventType === 'DELETE') {
          setCurrentDelivery(null);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(deliverySubscription);
    };
  }, [driverId]);
  
  const updateDeliveryStatus = async (status: string) => {
    if (!currentDelivery) return;
    
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status,
          ...(status === 'completed' ? {
            completed_at: new Date().toISOString()
          } : {})
        })
        .eq('id', currentDelivery.id);
        
      if (error) {
        console.error('Error updating delivery status:', error);
        toast.error(`Failed to update status: ${error.message}`);
        return;
      }
      
      toast.success(`Delivery marked as ${status}`);
      
      // Add tracking update
      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: currentDelivery.id,
          status: status === 'in_progress' ? 'Driver En Route' : status.charAt(0).toUpperCase() + status.slice(1),
          timestamp: new Date().toISOString(),
          location: status === 'completed' ? currentDelivery.delivery_location : currentDelivery.pickup_location,
          note: status === 'completed' 
            ? 'Package has been delivered successfully' 
            : `Delivery status updated to ${status}`
        });
        
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update delivery status');
    }
  };
  
  if (!driverId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="mx-auto h-10 w-10 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Driver ID Required</h3>
                <p>A driver ID is required to access this page</p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>
          
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center py-8">Loading...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {driver && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Driver Information</CardTitle>
                    <CardDescription>Welcome back, {driver.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {driver.photo ? (
                          <img src={driver.photo} alt={driver.name} className="w-full h-full object-cover" />
                        ) : (
                          <MapPin className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{driver.name}</h3>
                        <p className="text-gray-600">{driver.vehicle_type}</p>
                        <p className="text-sm text-gray-500">{driver.phone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Location Sharing</CardTitle>
                    <CardDescription>Share your real-time location with customers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DriverLocationTracker 
                      driverId={driverId} 
                      deliveryId={currentDelivery?.id} 
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Current Delivery</CardTitle>
                    <CardDescription>
                      {currentDelivery 
                        ? `Delivery #${currentDelivery.tracking_id || currentDelivery.id}` 
                        : 'No active delivery assigned'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentDelivery ? (
                      <div className="space-y-4">
                        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Status:</span>
                            <span className="font-medium">
                              {currentDelivery.status.charAt(0).toUpperCase() + currentDelivery.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Pick-up:</span>
                            <span>{currentDelivery.pickup_location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Delivery:</span>
                            <span>{currentDelivery.delivery_location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Package:</span>
                            <span>{currentDelivery.package_type}</span>
                          </div>
                        </div>
                        
                        <div className="flex justify-between gap-4 pt-2">
                          {currentDelivery.status === 'pending' && (
                            <Button 
                              onClick={() => updateDeliveryStatus('in_progress')}
                              className="flex-1"
                            >
                              Start Delivery
                            </Button>
                          )}
                          
                          {currentDelivery.status === 'in_progress' && (
                            <Button 
                              onClick={() => updateDeliveryStatus('completed')}
                              className="flex-1"
                              variant="default"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                        <Package className="h-12 w-12 text-gray-300 mb-4" />
                        <p>No active delivery assigned</p>
                        <p className="text-sm text-gray-400 mt-1">
                          New deliveries will appear here
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverDashboard; 