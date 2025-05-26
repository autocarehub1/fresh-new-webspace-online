import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Clock, Package, User, Phone, Mail, FileText, CheckCircle2, ClipboardCheck, PlusCircle, AlertCircle } from 'lucide-react';
import { DeliveryRequest, Driver } from '@/types/delivery';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DriverAssignmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: DeliveryRequest | undefined;
  onSuccess: () => void;
}

const DriverAssignment: React.FC<DriverAssignmentProps> = ({ open, onOpenChange, request, onSuccess }) => {
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  React.useEffect(() => {
    const fetchDrivers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('status', 'active');
        
        if (error) {
          throw error;
        }
        
        setAvailableDrivers(data || []);
      } catch (error: any) {
        console.error('Error fetching drivers:', error);
        setError(error.message || 'Failed to load drivers');
        toast.error('Failed to load drivers');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDrivers();
  }, []);
  
  const handleAssignDriver = async (driverId: string) => {
    if (!request) return;
    
    try {
      setIsAssigning(driverId);
      
      // Fix the address property access
      const pickupAddress = typeof request.pickup_location === 'string' 
        ? request.pickup_location 
        : request.pickup_location;
      
      // Use delivery_time instead of delivery_time_window if it doesn't exist
      const deliveryWindow = request.delivery_time_window || request.delivery_time || 'Standard delivery';
      
      const slackMessage = `New delivery assigned to driver ${driverId}:\n` +
                           `Pickup: ${pickupAddress}\n` +
                           `Delivery: ${request.delivery_location}\n` +
                           `Priority: ${request.priority}\n` +
                           `Delivery Time: ${deliveryWindow}`;
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({ assigned_driver: driverId })
        .eq('id', request.id);
      
      if (error) {
        throw error;
      }
      
      // Send Slack notification
      const { error: slackError } = await supabase.functions.invoke('send-slack-notification', {
        body: {
          message: slackMessage,
          delivery: {
            id: request.id,
            pickup_location: request.pickup_location,
            delivery_location: request.delivery_location,
            status: request.status,
            priority: request.priority,
            packageType: request.packageType,
            distance: 2.5,
            trackingId: request.trackingId || request.id
          }
        }
      });
      
      if (slackError) {
        console.error('Slack notification error:', slackError);
        toast.error('Failed to send Slack notification');
      }
      
      toast.success('Driver assigned successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error assigning driver:', error);
      setError(error.message || 'Failed to assign driver');
      toast.error('Failed to assign driver');
    } finally {
      setIsAssigning(null);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Driver</DialogTitle>
        </DialogHeader>
        
        {request ? (
          <div className="py-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Request Information</CardTitle>
                <CardDescription>Details of the delivery request</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 pt-0">
                <div>
                  <p className="text-sm font-medium">Pickup Location:</p>
                  <p className="text-sm">{request.pickup_location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Delivery Location:</p>
                  <p className="text-sm">{request.delivery_location}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Priority:</p>
                  <Badge variant={request.priority === 'urgent' ? 'destructive' : 'outline'}>
                    {request.priority || 'normal'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Package Type:</p>
                  <p className="text-sm">{request.packageType || 'Not specified'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Separator className="my-4" />
            
            <h3 className="text-lg font-medium mb-2">Available Drivers</h3>
            
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : availableDrivers.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Drivers Available</AlertTitle>
                <AlertDescription>
                  There are currently no active drivers available to assign.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4">
                {availableDrivers.map(driver => (
                  <Card key={driver.id} className="border">
                    <CardContent className="flex items-center justify-between p-3">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage src={driver.photo} alt={driver.name} />
                          <AvatarFallback>{driver.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-sm font-medium">{driver.name}</CardTitle>
                          <CardDescription className="text-xs text-gray-500">
                            {driver.vehicle_type} - {driver.vehicle_number || 'Not specified'}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAssignDriver(driver.id)}
                        disabled={isAssigning === driver.id}
                      >
                        {isAssigning === driver.id ? 'Assigning...' : 'Assign'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              No delivery request was provided.
            </AlertDescription>
          </Alert>
        )}
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DriverAssignment;
