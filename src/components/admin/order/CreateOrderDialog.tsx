import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase, refreshSchemaCache } from '@/lib/supabase';
import jsPDF from 'jspdf';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useDeliveryData } from '@/hooks/use-delivery-data';

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const createLogoDataUrl = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  // Fill background (transparent)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create logo with gradient (matching the navbar style)
  const gradient = ctx.createLinearGradient(20, 20, 80, 80);
  gradient.addColorStop(0, '#0C4E9A'); // medical-blue
  gradient.addColorStop(1, '#1E9ABE'); // medical-teal
  
  // Draw logo box
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(20, 20, 60, 60, 8);
  ctx.fill();
  
  // Add CNL text to logo
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CNL', 50, 60);
  
  // Add company name text
  ctx.fillStyle = '#0C4E9A'; // medical-blue
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Catalyst', 95, 50);
  
  ctx.fillStyle = '#1E9ABE'; // medical-teal
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Network', 200, 50);
  
  ctx.fillStyle = '#0C4E9A'; // medical-blue
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Logistics', 140, 80);
  
  return canvas.toDataURL('image/png');
};

const generatePrePickupInvoice = (requestData: any, clientName: string = "Medical Client") => {
  try {
    const doc = new jsPDF();
    
    // Add logo
    const logoDataUrl = createLogoDataUrl();
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', 10, 10, 180, 45);
    }
    
    // Add content to the PDF
    doc.setFontSize(18);
    doc.text("PRE-PICKUP INVOICE", 105, 70, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Invoice Number: PRE-${requestData.id}`, 20, 85);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 95);
    doc.text(`Client: ${clientName}`, 20, 105);
    
    // Add delivery details
    doc.text(`Request ID: ${requestData.id}`, 20, 115);
    doc.text(`Tracking ID: ${requestData.trackingId}`, 20, 125);
    doc.text(`Pickup Location: ${requestData.pickup_location}`, 20, 135);
    doc.text(`Delivery Location: ${requestData.delivery_location}`, 20, 145);
    
    doc.line(20, 155, 190, 155);
    
    doc.text("Description", 20, 165);
    doc.text("Amount", 160, 165);
    
    // Add package type and priority to description if available
    const description = [
      'Pre-Pickup Medical Courier Services',
      requestData.packageType ? `(${requestData.packageType})` : '',
      requestData.priority === 'urgent' ? '- URGENT' : ''
    ].filter(Boolean).join(' ');
    
    doc.text(description, 20, 175);
    
    // Default cost is $25, but can be customized in a real implementation
    const cost = requestData.estimated_cost || 25.00;
    doc.text(`$${cost.toFixed(2)}`, 160, 175);
    
    doc.line(20, 195, 190, 195);
    
    doc.text("Estimated Total:", 130, 205);
    doc.text(`$${cost.toFixed(2)}`, 160, 205);
    
    // Add notes if available
    if (requestData.notes) {
      doc.text("Notes:", 20, 220);
      // Split long notes into multiple lines if needed
      const noteLines = doc.splitTextToSize(requestData.notes, 150);
      doc.text(noteLines, 20, 225);
    }
    
    // Add footer
    doc.setFontSize(10);
    doc.text("This is a pre-pickup invoice. Final charges may vary based on actual delivery details.", 105, 240, { align: 'center' });
    doc.text("Thank you for choosing Catalyst Network Logistics for your medical courier needs.", 105, 250, { align: 'center' });
    doc.text("Payment due within 30 days of invoice date.", 105, 260, { align: 'center' });
    
    // Save the PDF 
    doc.save(`Pre_Pickup_Invoice_${requestData.id}.pdf`);
    
    return true;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    return false;
  }
};

const CreateOrderDialog = ({ open, onOpenChange }: CreateOrderDialogProps) => {
  const { refetch } = useDeliveryData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    pickup_location: '',
    delivery_location: '',
    packageType: 'Medical Supplies',
    priority: 'normal',
    email: '',
    requester_name: '',
    notes: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateOrder = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSuccess(false);
    setError('');

    try {
      console.log('CreateOrderDialog: Attempting schema refresh before order submission...');
      const schemaRefreshed = await refreshSchemaCache();
      console.log('CreateOrderDialog: Schema refresh attempt completed. Success:', schemaRefreshed);

      if (!schemaRefreshed) {
        setError('Failed to verify database schema. Please check console logs. Try again or contact support.');
        setIsSubmitting(false);
        toast.error('Database schema out of sync. Could not submit order.');
        return;
      }
      
      const form = event.target as HTMLFormElement;
      const requestId = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const orderPayload = {
        id: requestId,
        pickup_location: form.pickup.value,
        delivery_location: form.delivery.value,
        package_type: form.packageType.value,
        priority: form.priority.value,
        status: 'pending',
        notes: form.notes?.value || '',
        requester_name: form.requester_name?.value || null
      };
      
      console.log('CreateOrderDialog: Submitting request with payload:', JSON.stringify(orderPayload, null, 2));
      
      const { error: requestError } = await supabase
        .from('delivery_requests')
        .insert(orderPayload);
        
      if (requestError) {
        console.error('CreateOrderDialog: Error submitting request:', requestError);
        if (requestError.message.toLowerCase().includes('requester_name')) {
            console.error('CreateOrderDialog: DETECTED `requester_name` column issue in Supabase error:', requestError.message);
        }
        setError(`Failed to submit request. DB Error: ${requestError.details || requestError.message}`);
        toast.error('Order submission failed. Check details.');
        throw new Error(`Failed to submit request: ${requestError.message}`);
      }
      
      console.log('Successfully created order with ID:', requestId);
      setSuccess(true);
      
      await refetch();
      
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
        form.reset();
      }, 1500);
      
    } catch (err: any) {
      console.error('Failed to create order (outer catch):', err);
      if (!error) {
        setError(err.message || 'Failed to create order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
          <DialogDescription>
            Enter the details to create a new delivery request
          </DialogDescription>
        </DialogHeader>
        
        {success ? (
          <div className="flex flex-col items-center justify-center py-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Order Created!</h3>
            <p className="text-center text-gray-500">
              The new delivery request has been created successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <Input 
                id="pickup" 
                name="pickup" 
                placeholder="Enter full pickup address" 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delivery">Delivery Location</Label>
              <Input 
                id="delivery" 
                name="delivery" 
                placeholder="Enter full delivery address" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageType">Package Type</Label>
                <Select name="packageType" defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue placeholder="Select package type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="medical-supplies">Medical Supplies</SelectItem>
                    <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                    <SelectItem value="laboratory-samples">Lab Samples</SelectItem>
                    <SelectItem value="equipment">Medical Equipment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select name="priority" defaultValue="normal">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="requester_name">Requester Name</Label>
                <Input 
                  id="requester_name" 
                  name="requester_name" 
                  placeholder="Enter requester name" 
                  value={formData.requester_name}
                  onChange={e => handleChange('requester_name', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                placeholder="Any special instructions or details..." 
                className="h-20"
              />
            </div>
            
            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            
            <div className="flex justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                className="mr-2"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog; 