
import { toast } from 'sonner';
import { DeliveryRequest } from '@/types/delivery';

export const useNotificationEmail = () => {
  const sendStatusNotification = async (request: DeliveryRequest, status: string, status_note?: string) => {
    try {
      const email = (request as any).email || "demo@example.com";
      if (!email) return;
      
      console.log("Sending status notification email to:", email, "status:", status);
      
      const body = {
        id: request.id,
        trackingId: request.trackingId,
        pickup_location: request.pickup_location,
        delivery_location: request.delivery_location,
        priority: request.priority,
        package_type: request.packageType,
        email,
        status,
        status_note,
        assigned_driver: request.assigned_driver,
      };
      
      const origin = window.location.origin;
      const baseUrl = origin.includes('localhost') 
        ? "https://joziqntfciyflfsgvsqz.supabase.co"
        : origin;
      
      const response = await fetch(`${baseUrl}/functions/v1/send-confirmation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to send notification email");
      }
      
      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        console.log("Response was not valid JSON:", err);
      }
      
      toast.success("Status notification email sent");
    } catch (err) {
      console.error("Failed to send notification:", err);
      toast.error("Failed to send status notification email");
    }
  };

  return { sendStatusNotification };
};

