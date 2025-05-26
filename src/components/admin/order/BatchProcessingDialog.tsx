import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from "@/components/ui/scroll-area"
import { DeliveryRequest } from '@/types/delivery';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface BatchProcessingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requests: DeliveryRequest[];
  onSuccess: () => void;
}

const BatchProcessingDialog: React.FC<BatchProcessingDialogProps> = ({ open, onOpenChange, requests, onSuccess }) => {
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
  const [newStatus, setNewStatus] = useState<string>('');
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckboxChange = (requestId: string) => {
    setSelectedRequests(prev =>
      prev.includes(requestId) ? prev.filter(id => id !== requestId) : [...prev, requestId]
    );
  };

  const handleStatusChange = (status: string) => {
    setNewStatus(status);
  };

  const handleDriverChange = (driverId: string) => {
    setSelectedDriver(driverId);
  };

  const handleBulkStatusUpdate = async () => {
    if (!selectedRequests.length || !newStatus) return;
    
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({ status: newStatus })
        .in('id', selectedRequests);
      
      if (error) throw error;
      
      toast.success('Bulk status update successful');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating statuses:', error);
      toast.error('Failed to update statuses');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAssignment = async () => {
    if (!selectedRequests.length || !selectedDriver) return;
    
    try {
      setIsProcessing(true);
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({ assigned_driver: selectedDriver })
        .in('id', selectedRequests);
      
      if (error) throw error;
      
      toast.success('Bulk driver assignment successful');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning drivers:', error);
      toast.error('Failed to assign drivers');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Batch Processing</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Update Status</Label>
              <Select onValueChange={handleStatusChange}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="driver">Assign Driver</Label>
              <Input
                type="text"
                id="driver"
                placeholder="Driver ID"
                onChange={e => handleDriverChange(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <Label>Select Requests</Label>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {requests.map(request => (
                <div key={request.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={request.id}
                    checked={selectedRequests.includes(request.id)}
                    onCheckedChange={() => handleCheckboxChange(request.id)}
                  />
                  <Label htmlFor={request.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {request.id} - {request.pickup_location} to {request.delivery_location}
                  </Label>
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleBulkStatusUpdate} disabled={isProcessing || !newStatus}>
            {isProcessing ? 'Updating...' : 'Update Statuses'}
          </Button>
          <Button type="button" onClick={handleBulkAssignment} disabled={isProcessing || !selectedDriver}>
            {isProcessing ? 'Assigning...' : 'Assign Drivers'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BatchProcessingDialog;
