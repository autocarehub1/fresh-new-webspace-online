
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export class EmailNotificationService {
  
  // Send delivery status notification
  static async sendDeliveryStatusNotification(
    deliveryId: string, 
    status: string, 
    recipientEmail: string,
    additionalData?: any
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('send-delivery-notification', {
        body: {
          deliveryId,
          status,
          recipientEmail,
          additionalData,
          type: 'status_update'
        }
      });

      if (error) throw error;
      
      console.log('Email notification sent:', data);
      return data;
    } catch (error) {
      console.error('Email notification failed:', error);
      toast.error('Failed to send email notification');
      throw error;
    }
  }

  // Send driver assignment notification
  static async sendDriverAssignmentNotification(
    driverId: string,
    deliveryId: string,
    customerEmail: string
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('send-driver-assignment', {
        body: {
          driverId,
          deliveryId,
          customerEmail,
          type: 'driver_assignment'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Driver assignment notification failed:', error);
      throw error;
    }
  }

  // Send emergency alert
  static async sendEmergencyAlert(
    driverId: string,
    location: { lat: number; lng: number },
    message: string
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('send-emergency-alert', {
        body: {
          driverId,
          location,
          message,
          timestamp: new Date().toISOString(),
          type: 'emergency'
        }
      });

      if (error) throw error;
      toast.success('Emergency alert sent successfully');
      return data;
    } catch (error) {
      console.error('Emergency alert failed:', error);
      toast.error('Failed to send emergency alert');
      throw error;
    }
  }

  // Send delivery completion notification with proof
  static async sendDeliveryCompletionNotification(
    deliveryId: string,
    proofOfDeliveryUrl?: string,
    signature?: string
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('send-completion-notification', {
        body: {
          deliveryId,
          proofOfDeliveryUrl,
          signature,
          completedAt: new Date().toISOString(),
          type: 'delivery_completion'
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Completion notification failed:', error);
      throw error;
    }
  }
}
