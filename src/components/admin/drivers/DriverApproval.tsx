
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Eye, Check, X, AlertCircle } from 'lucide-react';

interface PendingDriver {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicle_type: string;
  profile_completed: boolean;
  verification_status: string;
  created_at: string;
}

const DriverApproval: React.FC = () => {
  const [pendingDrivers, setPendingDrivers] = useState<PendingDriver[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<PendingDriver | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDrivers();
    setupRealtimeSubscription();
  }, []);

  const fetchPendingDrivers = async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .in('status', ['pending', 'inactive'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingDrivers(data || []);
    } catch (error) {
      console.error('Error fetching pending drivers:', error);
      toast.error('Failed to load pending drivers');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('driver_approvals')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'drivers'
      }, () => {
        fetchPendingDrivers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleApproveDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          status: 'active',
          verification_status: 'verified'
        })
        .eq('id', driverId);

      if (error) throw error;

      toast.success('Driver approved successfully');
      fetchPendingDrivers();
    } catch (error) {
      console.error('Error approving driver:', error);
      toast.error('Failed to approve driver');
    }
  };

  const handleRejectDriver = async (driverId: string) => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          status: 'suspended',
          verification_status: 'rejected'
        })
        .eq('id', driverId);

      if (error) throw error;

      toast.success('Driver rejected');
      fetchPendingDrivers();
    } catch (error) {
      console.error('Error rejecting driver:', error);
      toast.error('Failed to reject driver');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center">Loading pending driver approvals...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Driver Approval Queue ({pendingDrivers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingDrivers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No drivers pending approval
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Vehicle Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell>{driver.email}</TableCell>
                    <TableCell>{driver.phone}</TableCell>
                    <TableCell>{driver.vehicle_type}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={driver.profile_completed ? 'default' : 'secondary'}
                      >
                        {driver.profile_completed ? 'Complete' : 'Incomplete'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(driver.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedDriver(driver)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveDriver(driver.id)}
                          disabled={!driver.profile_completed}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectDriver(driver.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Driver Details: {selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <p className="text-sm text-gray-600">{selectedDriver.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-gray-600">{selectedDriver.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-gray-600">{selectedDriver.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Vehicle Type</label>
                  <p className="text-sm text-gray-600">{selectedDriver.vehicle_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Profile Status</label>
                  <Badge variant={selectedDriver.profile_completed ? 'default' : 'secondary'}>
                    {selectedDriver.profile_completed ? 'Complete' : 'Incomplete'}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium">Application Date</label>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedDriver.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    handleApproveDriver(selectedDriver.id);
                    setSelectedDriver(null);
                  }}
                  disabled={!selectedDriver.profile_completed}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Driver
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRejectDriver(selectedDriver.id);
                    setSelectedDriver(null);
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject Driver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DriverApproval;
