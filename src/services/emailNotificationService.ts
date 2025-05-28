
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { BrevoEmailService } from './brevoEmailService';

export class EmailNotificationService {
  
  // Send delivery status notification
  static async sendDeliveryStatusNotification(
    deliveryId: string, 
    status: string, 
    recipientEmail: string,
    additionalData?: any
  ) {
    try {
      // Use Brevo service directly for better rate limit handling
      const success = await BrevoEmailService.sendDeliveryStatusNotification(
        recipientEmail,
        status,
        { trackingId: deliveryId, ...additionalData }
      );

      if (success) {
        console.log('Email notification sent via Brevo:', deliveryId);
        return { success: true };
      } else {
        // Fallback to Supabase function if Brevo direct call fails
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
        return data;
      }
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
      // Use Brevo service for consistent email handling
      const success = await BrevoEmailService.sendDeliveryStatusNotification(
        customerEmail,
        'driver_assigned',
        { trackingId: deliveryId, assigned_driver: driverId }
      );

      if (!success) {
        // Fallback to Supabase function
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
      }
      return { success: true };
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
      // For emergency alerts, use direct Supabase function for immediate processing
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
