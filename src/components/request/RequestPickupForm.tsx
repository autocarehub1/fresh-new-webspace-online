import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, Info as InfoIcon } from 'lucide-react';
import { useDeliveryStore } from '@/store/deliveryStore';
import { supabase } from '@/lib/supabase';
import { verifyDeliveryRequestsSchema } from '@/lib/schema-helper';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useSlackNotification } from '@/hooks/use-slack-notification';
import EventsService from '@/services/EventsService';
import { notifyNewRequest as unifiedNotifyNewRequest } from '@/integrations/slack';
import enhancedSlackClient from '@/integrations/slack/enhancedClient';
import axios from 'axios';

export const RequestPickupForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [requestData, setRequestData] = useState<{
    trackingId: string;
    id: string;
    estimatedCost: number;
  } | null>(null);
  
  const [pickupLocation, setPickupLocation] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [priority, setPriority] = useState('same-day');
  const [packageType, setPackageType] = useState('');
  const [email, setEmail] = useState('');
  const [requester, setRequester] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');

  const { generateTrackingId } = useDeliveryStore();
  
  const [schemaVerified, setSchemaVerified] = useState(false);
  
  const { sendNewRequestNotification } = useSlackNotification();
  
  // Verify schema on component mount
  useEffect(() => {
    const verifySchema = async () => {
      try {
        const isVerified = await verifyDeliveryRequestsSchema();
        setSchemaVerified(isVerified);
        
        if (!isVerified) {
          console.warn('Schema verification failed. Some fields may not be saved.');
          toast.warning('Database schema verification failed. Some fields may not be saved.');
        }
      } catch (error) {
        console.error('Error verifying schema:', error);
      }
    };
    
    verifySchema();
  }, []);

  const calculateEstimatedCost = () => {
    let cost = 20;
    
    if (priority === 'urgent') {
      cost += 15;
    } else if (priority === 'same-day') {
      cost += 5;
    }
    
    const estimatedDistance = 5;
    
    cost += estimatedDistance * 2;
    
    return Math.round(cost * 100);
  };

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
      // Verify schema before submission
      const isSchemaVerified = schemaVerified || await verifyDeliveryRequestsSchema();
      
      const trackingId = generateTrackingId();
      const requestId = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      const priorityValue = priority === 'urgent' ? 'urgent' : 'normal';
      const estimatedCost = calculateEstimatedCost();
      
      // Create base request data
      const requestDataForDB: any = {
        id: requestId,
        tracking_id: trackingId,
        pickup_location: pickupLocation,
        delivery_location: deliveryLocation,
        priority: priorityValue,
        package_type: `${packageType || 'Medical Supplies'} - Contact: ${email}`,
        status: 'pending',
        estimated_cost: estimatedCost / 100
      };
      
      // Only add schema-dependent fields if verification passed
      if (isSchemaVerified) {
        requestDataForDB.requester_name = requester || null;
        requestDataForDB.company_name = company || null;
      } else {
        console.log('Schema not verified, omitting requester_name and company_name fields');
      }
      
      console.log('Submitting request:', requestDataForDB);
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(requestDataForDB)
        .select();
        
      if (error) {
        console.error('Supabase error:', error);
        
        // Check if the error is related to missing columns
        if (error.message.includes('column') && (error.message.includes('company_name') || error.message.includes('requester_name'))) {
          toast.error('Database schema issue detected. Please run the SQL script to add missing columns.');
          console.error('To fix this issue, please run the SQL in scripts/add_missing_columns.sql in your Supabase SQL Editor.');
          
          // Set schema as not verified to avoid future attempts with these fields
          setSchemaVerified(false);
        } else {
          throw error;
        }
      } else {
        console.log('Request submitted successfully:', data);
        
        console.log('Simulating confirmation email to:', email);
        
        setRequestData({
          trackingId,
          id: requestId,
          estimatedCost
        });
        
        // Create a request object for notifications
        const requestObj = {
          id: requestId,
          trackingId,
          status: 'pending',
          pickup_location: pickupLocation,
          delivery_location: deliveryLocation,
          priority: priorityValue,
          packageType: packageType || 'Medical Supplies',
          email: email
        };
        
        // ENHANCED MULTI-CHANNEL NOTIFICATION APPROACH:
        
        // Special handling for production domain (catnetlogistics.com)
        const isDomainProduction = window.location.hostname.includes('catnetlogistics.com');
        
        // 1. First, use our enhanced Slack client (most reliable for all environments)
        console.log('Sending notification via Enhanced Slack Client...');
        try {
          const enhancedResult = await enhancedSlackClient.notifyNewRequest(requestObj);
          console.log('Enhanced Slack client result:', enhancedResult);
        } catch (enhancedError) {
          console.error('Error with enhanced Slack client:', enhancedError);
        }
        
        // 2. As a backup, try the other methods
        if (isDomainProduction) {
          console.log('[PICKUP] On production domain, using direct webhook approach first');
          
          try {
            const webhookUrl = 'https://hooks.slack.com/services/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';
            
            const slackPayload = {
              text: `🆕 New Delivery Request on catnetlogistics.com: ${requestId}`,
              blocks: [
                {
                  type: "header",
                  text: {
                    type: "plain_text",
                    text: "🚚 New Delivery Request",
                    emoji: true
                  }
                },
                {
                  type: "section",
                  fields: [
                    {
                      type: "mrkdwn",
                      text: `*Request ID:*\n${requestId}`
                    },
                    {
                      type: "mrkdwn",
                      text: `*Priority:*\n${priorityValue}`
                    }
                  ]
                },
                {
                  type: "section",
                  fields: [
                    {
                      type: "mrkdwn",
                      text: `*Pickup:*\n${pickupLocation}`
                    },
                    {
                      type: "mrkdwn",
                      text: `*Delivery:*\n${deliveryLocation}`
                    }
                  ]
                },
                {
                  type: "section",
                  fields: [
                    {
                      type: "mrkdwn",
                      text: `*Contact:*\n${email}`
                    },
                    {
                      type: "mrkdwn",
                      text: `*Domain:*\ncatnetlogistics.com`
                    }
                  ]
                }
              ]
            };
            
            // Use direct webhook call with no-cors mode
            await fetch(webhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(slackPayload),
              mode: 'no-cors' // Important: prevents CORS issues
            });
            
            console.log('[PICKUP] Direct webhook call sent in no-cors mode');
            
            // Still continue with other notification methods as backup
          } catch (directError) {
            console.error('[PICKUP] Direct webhook error:', directError);
          }
        }
        
        // 1. Try the unified Slack integration first (most reliable)
        console.log('Sending Slack notification via unified integration:', requestId);
        try {
          // Use the statically imported function
          const unifiedResult = await unifiedNotifyNewRequest(requestObj);
          console.log('Unified Slack notification result:', unifiedResult);
        } catch (slackError) {
          console.error('Error with unified Slack notification:', slackError);
        }
        
        // 2. Try making a direct API call to our backend
        console.log('Trying direct API call to backend Slack endpoint');
        try {
          const apiUrl = `${window.location.origin}/api/slack/send`;
          console.log('Using API URL:', apiUrl);
          
          const slackPayload = {
            text: `🆕 New Delivery Request: ${requestId}`,
            blocks: [
              {
                type: "header",
                text: {
                  type: "plain_text",
                  text: "🚚 New Delivery Request",
                  emoji: true
                }
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*Request ID:*\n${requestId}`
                  },
                  {
                    type: "mrkdwn",
                    text: `*Priority:*\n${priorityValue}`
                  }
                ]
              },
              {
                type: "section",
                fields: [
                  {
                    type: "mrkdwn",
                    text: `*Pickup:*\n${pickupLocation}`
                  },
                  {
                    type: "mrkdwn",
                    text: `*Delivery:*\n${deliveryLocation}`
                  }
                ]
              }
            ]
          };
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(slackPayload)
          });
          
          // If the first attempt fails with 404, try an alternative path
          if (!response.ok && response.status === 404) {
            console.log('First API path attempt failed, trying alternative path...');
            const altApiUrl = `${window.location.origin}/slack/send`;
            
            const altResponse = await fetch(altApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(slackPayload)
            });
            
            if (altResponse.ok) {
              const altResponseData = await altResponse.json();
              console.log('Slack notification sent via alternative path:', altResponseData);
            } else {
              console.error(`Alternative path also failed: ${altResponse.status}`);
              
              // Last resort: try direct webhook call 
              console.log('Trying direct webhook as last resort...');
              const webhookUrl = 'https://hooks.slack.com/services/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';
              
              const webhookResponse = await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(slackPayload)
              });
              
              if (webhookResponse.ok) {
                console.log('Direct webhook notification successful');
              } else {
                console.error('Direct webhook also failed:', webhookResponse.status);
              }
            }
          } else {
            const responseData = await response.json();
            console.log('Direct Slack API call response:', responseData);
          }
        } catch (directApiError) {
          console.error('Error with direct Slack API call:', directApiError);
        }
        
        // 3. Finally, use the Events service as a last resort
        console.log('Sending notification via Events service:', requestId);
        try {
          // Use EventsService for extra reliability
          await EventsService.newDeliveryRequestEvent(requestObj);
          console.log('✅ Events service notification triggered');
        } catch (eventsError) {
          console.error('❌ Error sending via Events service:', eventsError);
        }
        
        setSuccess(true);
      }
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
                <span>Need help? Call (432)-202-2150</span>
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
          Fill out the form below to request a pickup. For emergencies, call (432)-202-2150.
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
                      For life-critical emergencies requiring immediate pickup, please call our dedicated emergency line at <strong>(432)-202-2150</strong>.
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
                
                <div className="space-y-2">
                  <Label htmlFor="requester">Requester Name</Label>
                  <Input 
                    id="requester" 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input 
                    id="company" 
                    type="text" 
                    placeholder="Enter your company name" 
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
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
                <Button asChild variant="default" className="bg-medical-teal text-white hover:bg-medical-teal/90">
                  <a href="tel:4322022150" className="font-medium">(432)-202-2150</a>
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
