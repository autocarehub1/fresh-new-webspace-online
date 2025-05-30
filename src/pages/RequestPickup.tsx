import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, Calendar, Clock, Package, MapPin, User, Phone, Mail, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { EmailService } from '@/services/emailService';
import { RequestEmailData } from '@/services/emailTemplateService';

const serviceCategories = {
  medical: [
    { value: 'urgent', label: 'Urgent Delivery' },
    { value: 'same-day', label: 'Same-Day Delivery' },
    { value: 'scheduled', label: 'Scheduled Routes' },
    { value: 'temperature-controlled', label: 'Temperature-Controlled' },
    { value: 'specimen', label: 'Specimen Transport' },
    { value: 'equipment', label: 'Equipment Transport' },
    { value: 'pharmaceutical', label: 'Pharmaceutical Delivery' },
    { value: 'document', label: 'Document Courier' }
  ],
  baggage: [
    { value: 'airport-baggage', label: 'Airport Baggage Delivery' },
    { value: 'luggage-storage', label: 'Luggage Storage & Delivery' }
  ],
  pet: [
    { value: 'pet-transportation', label: 'Pet Transportation' },
    { value: 'veterinary-transport', label: 'Veterinary Transport' }
  ],
  home: [
    { value: 'furniture-delivery', label: 'Furniture Delivery' },
    { value: 'home-improvement', label: 'Home Improvement Materials' }
  ]
};

const RequestPickup = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    serviceCategory: searchParams.get('category') || 'medical',
    serviceType: searchParams.get('service') || '',
    pickupAddress: '',
    deliveryAddress: '',
    pickupDate: '',
    pickupTime: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    specialInstructions: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Form submitted:', formData);

      // Generate unique request ID
      const requestId = `REQ-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const trackingId = `TRK-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      
      // Map service types to package types
      const packageTypeMapping: Record<string, string> = {
        'urgent': 'medical_supplies',
        'same-day': 'medical_supplies',
        'scheduled': 'medical_supplies',
        'temperature-controlled': 'medical_supplies',
        'specimen': 'lab_samples',
        'equipment': 'equipment',
        'pharmaceutical': 'medication',
        'document': 'documents',
        'airport-baggage': 'baggage',
        'luggage-storage': 'baggage',
        'pet-transportation': 'pet_transport',
        'veterinary-transport': 'pet_transport',
        'furniture-delivery': 'furniture',
        'home-improvement': 'materials'
      };

      // Determine priority based on service type
      const urgentServices = ['urgent', 'specimen', 'pharmaceutical'];
      const priority = urgentServices.includes(formData.serviceType) ? 'urgent' : 'normal';

      // Calculate estimated delivery time
      const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      const estimatedDelivery = new Date(pickupDateTime.getTime() + (priority === 'urgent' ? 2 : 4) * 60 * 60 * 1000);

      // Create delivery request payload with correct column names
      const deliveryRequest = {
        id: requestId,
        tracking_id: trackingId,
        pickup_location: formData.pickupAddress,
        delivery_location: formData.deliveryAddress,
        package_type: packageTypeMapping[formData.serviceType] || 'medical_supplies',
        priority: priority,
        status: 'pending',
        estimated_delivery: estimatedDelivery.toISOString(),
        // Use the correct column names that exist in the database
        email: formData.contactEmail,
        created_at: new Date().toISOString()
      };

      console.log('Creating delivery request:', deliveryRequest);

      // Save to Supabase
      const { data, error } = await supabase
        .from('delivery_requests')
        .insert(deliveryRequest)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Failed to create request: ${error.message}`);
      }

      console.log('Request created successfully:', data);

      // Send confirmation email
      try {
        const emailData: RequestEmailData = {
          requestId,
          trackingId,
          customerName: formData.contactName,
          customerEmail: formData.contactEmail,
          pickupLocation: formData.pickupAddress,
          deliveryLocation: formData.deliveryAddress,
          serviceType: serviceCategories[formData.serviceCategory as keyof typeof serviceCategories]
            .find(s => s.value === formData.serviceType)?.label || formData.serviceType,
          priority,
          specialInstructions: formData.specialInstructions,
          estimatedDelivery: estimatedDelivery.toLocaleString()
        };

        await EmailService.sendRequestConfirmationEmail(emailData);
        console.log('Confirmation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
        // Continue with success message even if email fails
      }

      toast({
        title: "Request Submitted Successfully",
        description: `Your delivery request has been created with ID: ${requestId}. A confirmation email has been sent to ${formData.contactEmail}.`,
      });

      // Navigate to tracking page
      navigate(`/tracking?id=${trackingId}`);

    } catch (error: any) {
      console.error('Error submitting request:', error);
      toast({
        title: "Error",
        description: error.message || "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-medical-blue mb-4">Request a Pickup</h1>
              <p className="text-gray-600">
                Fill out the form below to schedule your delivery service. We'll contact you to confirm the details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Service Selection */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="serviceCategory">Service Category</Label>
                  <Select
                    value={formData.serviceCategory}
                    onValueChange={(value) => handleSelectChange('serviceCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medical">Medical Delivery</SelectItem>
                      <SelectItem value="baggage">Baggage Delivery</SelectItem>
                      <SelectItem value="pet">Pet Delivery</SelectItem>
                      <SelectItem value="home">Home Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Select
                    value={formData.serviceType}
                    onValueChange={(value) => handleSelectChange('serviceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceCategories[formData.serviceCategory as keyof typeof serviceCategories].map((service) => (
                        <SelectItem key={service.value} value={service.value}>
                          {service.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="pickupAddress">Pickup Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Textarea
                      id="pickupAddress"
                      name="pickupAddress"
                      value={formData.pickupAddress}
                      onChange={handleChange}
                      placeholder="Enter pickup address"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="deliveryAddress">Delivery Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      placeholder="Enter delivery address"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="pickupDate">Pickup Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="date"
                      id="pickupDate"
                      name="pickupDate"
                      value={formData.pickupDate}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="pickupTime">Pickup Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="time"
                      id="pickupTime"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="tel"
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="(555) 555-5555"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label htmlFor="contactEmail">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      id="contactEmail"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-4">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <div className="relative">
                  <Info className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleChange}
                    placeholder="Any special requirements or instructions"
                    className="pl-10"
                    rows={4}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Request Pickup'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestPickup;
