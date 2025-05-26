import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { DeliveryRequest } from '@/types/delivery';

interface EditOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: DeliveryRequest;
  onSuccess: () => void;
}

const EditOrderDialog = ({ open, onOpenChange, request, onSuccess }: EditOrderDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pickup_location: '',
    delivery_location: '',
    packageType: '',
    priority: '',
    email: '',
    company_name: '',
    notes: '',
    status: '',
  });

  useEffect(() => {
    if (request) {
      setFormData({
        pickup_location: request.pickup_location || '',
        delivery_location: request.delivery_location || '',
        packageType: request.package_type || request.packageType || 'Medical Supplies',
        priority: request.priority || 'normal',
        email: request.email || '',
        company_name: request.company_name || '',
        notes: request.notes || '',
        status: request.status || 'pending',
      });
    }
  }, [request]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.pickup_location || !formData.delivery_location) {
      toast.error('Please fill in pickup and delivery locations');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const orderData = {
        pickup_location: formData.pickup_location,
        delivery_location: formData.delivery_location,
        package_type: formData.packageType,
        priority: formData.priority,
        email: formData.email,
        company_name: formData.company_name,
        notes: formData.notes,
        status: formData.status,
      };
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .update(orderData)
        .eq('id', request.id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success('Order updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Order {request.trackingId}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-5 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={value => handleChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={value => handleChange('priority', value)}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={formData.company_name}
                onChange={e => handleChange('company_name', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input
              id="pickupLocation"
              value={formData.pickup_location}
              onChange={e => handleChange('pickup_location', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deliveryLocation">Delivery Location</Label>
            <Input
              id="deliveryLocation"
              value={formData.delivery_location}
              onChange={e => handleChange('delivery_location', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="packageType">Package Type</Label>
            <Select 
              value={formData.packageType} 
              onValueChange={value => handleChange('packageType', value)}
            >
              <SelectTrigger id="packageType">
                <SelectValue placeholder="Select package type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Medical Supplies">Medical Supplies</SelectItem>
                <SelectItem value="Laboratory Samples">Laboratory Samples</SelectItem>
                <SelectItem value="Blood Samples">Blood Samples</SelectItem>
                <SelectItem value="Pharmaceuticals">Pharmaceuticals</SelectItem>
                <SelectItem value="Specimen">Specimen</SelectItem>
                <SelectItem value="Medical Equipment">Medical Equipment</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
              placeholder="Special instructions or requirements"
              className="min-h-[100px]"
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrderDialog; 