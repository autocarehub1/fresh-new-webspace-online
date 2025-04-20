import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, InfoIcon } from 'lucide-react';
import { useDeliveryStore } from '@/store/deliveryStore';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const RequestPickupForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [requestData, setRequestData] = useState<{
    trackingId: string;
    id: string;
  } | null>(null);
  
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [priority, setPriority] = useState('same-day');
  const [packageType, setPackageType] = useState('');
  const [email, setEmail] = useState('');

  const { generateTrackingId } = useDeliveryStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pickupLocation || !deliveryLocation) {
      toast.error('Please fill in pickup and delivery locations');
      return;
    }

    if (!email) {
      toast.error('Please provide your email address for delivery confirmation');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const trackingId = generateTrackingId();
      const requestId = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const priorityValue = priority === 'urgent' ? 'urgent' : 'normal';
      
      const requestData = {
        id: requestId,
        tracking_id: trackingId,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        priority: priorityValue,
        package_type: packageType || 'Medical Supplies',
        status: 'pending',
      };
      
      console.log('Submitting request with data:', requestData);
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(requestData)
        .select();
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Request submitted successfully:', data);
      
      const emailResponse = await supabase.functions.invoke('send-confirmation', {
        body: {
          id: requestId,
          trackingId,
          pickup_location: pickupLocation,
          delivery_location: deliveryLocation,
          priority: priorityValue,
          package_type: packageType || 'Medical Supplies',
          email: email,
        },
      });

      if (emailResponse.error) {
        console.error('Error sending confirmation email:', emailResponse.error);
        toast.error('Request submitted but failed to send confirmation email');
      } else {
        console.log('Confirmation email sent successfully');
      }
      
      setRequestData({
        trackingId,
        id: requestId
      });
      
      setSuccess(true);
    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast.error(`Failed to submit request: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleTrackDelivery = () => {
    if (requestData?.trackingId) {
      navigate(`/tracking?id=${requestData.trackingId}`);
    }
  };
  
  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">Pickup Request Submitted</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              Your pickup request has been received. A confirmation has been sent to your email with tracking information.
            </p>
            <div className="p-4 bg-white rounded-lg border border-green-200 text-left w-full max-w-md">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Request ID:</span>
                <span className="font-medium">{requestData?.id || ''}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Tracking Number:</span>
                <span className="font-medium">{requestData?.trackingId || ''}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Estimated Pickup:</span>
                <span className="font-medium">30-45 minutes</span>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <Button onClick={handleTrackDelivery} className="w-full">Track This Pickup</Button>
              <Button onClick={() => setSuccess(false)} variant="outline">Request Another Pickup</Button>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <InfoIcon size={16} />
                <span>Need help? Call (210) 555-0123</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Medical Courier Pickup</CardTitle>
        <CardDescription>
          Fill out the form below to request a pickup. For emergencies, call (210) 555-0123.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="new" className="mb-8">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="new">New Request</TabsTrigger>
              <TabsTrigger value="recurring">Recurring Pickup</TabsTrigger>
            </TabsList>
            <TabsContent value="new">
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Pickup Priority</h3>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3 mb-4">
                    <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800">
                      For life-critical emergencies requiring immediate pickup, please call our dedicated emergency line at <strong>(210) 555-0123</strong>.
                    </p>
                  </div>
                  <RadioGroup defaultValue="same-day" value={priority} onValueChange={setPriority} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="urgent" id="urgent" />
                      <Label htmlFor="urgent" className="font-medium">Urgent (1-2 hours)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="same-day" id="same-day" />
                      <Label htmlFor="same-day" className="font-medium">Same-Day</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scheduled" id="scheduled" />
                      <Label htmlFor="scheduled" className="font-medium">Scheduled</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Your Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email for delivery notifications" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-gray-500">We'll send delivery updates to this email address</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Pickup Details</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickup-date">Pickup Date</Label>
                        <Input type="date" id="pickup-date" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pickup-time">Pickup Time</Label>
                        <Input type="time" id="pickup-time" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pickup-location">Pickup Location</Label>
                        <Input 
                          id="pickup-location" 
                          placeholder="Full address" 
                          value={pickupLocation}
                          onChange={(e) => setPickupLocation(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pickup-contact">Contact Person</Label>
                        <Input id="pickup-contact" placeholder="Name" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="pickup-phone">Contact Phone</Label>
                        <Input id="pickup-phone" placeholder="Phone number" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Delivery Details</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="delivery-location">Delivery Location</Label>
                        <Input 
                          id="delivery-location" 
                          placeholder="Full address" 
                          value={deliveryLocation}
                          onChange={(e) => setDeliveryLocation(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="delivery-contact">Contact Person</Label>
                        <Input id="delivery-contact" placeholder="Name" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="delivery-phone">Contact Phone</Label>
                        <Input id="delivery-phone" placeholder="Phone number" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="delivery-instructions">Special Instructions</Label>
                        <Textarea 
                          id="delivery-instructions" 
                          placeholder="Delivery instructions, access codes, etc."
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Package Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="package-type">Package Type</Label>
                        <Select value={packageType} onValueChange={setPackageType}>
                          <SelectTrigger id="package-type">
                            <SelectValue placeholder="Select package type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="specimen">Medical Specimen</SelectItem>
                            <SelectItem value="pharmaceutical">Pharmaceutical</SelectItem>
                            <SelectItem value="equipment">Medical Equipment</SelectItem>
                            <SelectItem value="documents">Sensitive Documents</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" min="1" defaultValue="1" />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="package-weight">Weight (approx.)</Label>
                        <Select>
                          <SelectTrigger id="package-weight">
                            <SelectValue placeholder="Select weight" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="under1">Under 1 lb</SelectItem>
                            <SelectItem value="1to5">1-5 lbs</SelectItem>
                            <SelectItem value="5to10">5-10 lbs</SelectItem>
                            <SelectItem value="10plus">Over 10 lbs</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Special Handling Requirements</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Switch id="temp-controlled" />
                          <Label htmlFor="temp-controlled">Temperature Controlled</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="biohazard" />
                          <Label htmlFor="biohazard">Biohazard</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="fragile" />
                          <Label htmlFor="fragile">Fragile</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch id="confidential" />
                          <Label htmlFor="confidential">Confidential</Label>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="temperature">Required Temperature (if applicable)</Label>
                        <Select>
                          <SelectTrigger id="temperature">
                            <SelectValue placeholder="Select temperature range" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frozen">Frozen (-20°C or below)</SelectItem>
                            <SelectItem value="refrigerated">Refrigerated (2-8°C)</SelectItem>
                            <SelectItem value="ambient">Ambient (15-25°C)</SelectItem>
                            <SelectItem value="custom">Custom Range</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="recurring">
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500 mb-4">
                  For recurring pickup schedules, please contact our customer service team.
                </p>
                <Button asChild variant="outline">
                  <a href="tel:2105550123">(210) 555-0123</a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 sm:justify-between">
        <p className="text-xs text-gray-500">
          By submitting this form, you agree to our terms of service and privacy policy.
        </p>
        <Button type="submit" onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting..." : "Submit Request"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RequestPickupForm;
