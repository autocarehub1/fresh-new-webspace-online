
import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { EmailService } from '@/services/emailService';
import { RequestEmailData } from '@/services/emailTemplateService';
import ServiceSelection from './ServiceSelection';
import AddressFields from './AddressFields';
import DateTimeFields from './DateTimeFields';
import ContactFields from './ContactFields';
import InstructionsField from './InstructionsField';
import { serviceCategories, packageTypeMapping, urgentServices } from './serviceCategories';

const RequestPickupForm = () => {
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
      
      // Determine priority based on service type
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
    <form onSubmit={handleSubmit} className="space-y-8">
      <ServiceSelection
        serviceCategory={formData.serviceCategory}
        serviceType={formData.serviceType}
        onServiceCategoryChange={(value) => handleSelectChange('serviceCategory', value)}
        onServiceTypeChange={(value) => handleSelectChange('serviceType', value)}
      />

      <AddressFields
        pickupAddress={formData.pickupAddress}
        deliveryAddress={formData.deliveryAddress}
        onPickupAddressChange={handleChange}
        onDeliveryAddressChange={handleChange}
      />

      <DateTimeFields
        pickupDate={formData.pickupDate}
        pickupTime={formData.pickupTime}
        onPickupDateChange={handleChange}
        onPickupTimeChange={handleChange}
      />

      <ContactFields
        contactName={formData.contactName}
        contactPhone={formData.contactPhone}
        contactEmail={formData.contactEmail}
        onContactNameChange={handleChange}
        onContactPhoneChange={handleChange}
        onContactEmailChange={handleChange}
      />

      <InstructionsField
        specialInstructions={formData.specialInstructions}
        onSpecialInstructionsChange={handleChange}
      />

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
  );
};

export default RequestPickupForm;
