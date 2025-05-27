import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeliveryRequest } from '@/types/delivery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRequestActions = () => {
  const queryClient = useQueryClient();

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({ status: 'pending' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({ status: 'declined' })
        .eq('id', id);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('delivery_requests')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
  });
  
  const statusUpdateMutation = useMutation({
    mutationFn: async ({ req, status }: { req: DeliveryRequest; status: string }) => {
      // Map status to correct database values - use the actual database enum values
      let dbStatus = status;
      if (status === 'delivered') {
        dbStatus = 'completed';
      }
      // Keep picked_up and in_transit as they are since they're causing constraint violations
      // Let's check what the actual allowed values are and use 'in_progress' for picked_up
      if (status === 'picked_up') {
        dbStatus = 'in_progress';
      }
      
      console.log(`Hook updating delivery ${req.id} from ${req.status} to ${dbStatus}`);
      
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({ status: dbStatus })
        .eq('id', req.id);
      
      if (error) {
        console.error('Status update error:', error);
        throw error;
      }
      
      // Add tracking update with appropriate status message
      const statusMessages: { [key: string]: string } = {
        'pending': 'Request Pending',
        'in_progress': 'Package Picked Up',
        'in_transit': 'Package In Transit',
        'completed': 'Package Delivered'
      };

      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: req.id,
          status: statusMessages[dbStatus] || dbStatus,
          timestamp: new Date().toISOString(),
          location: dbStatus === 'in_progress' ? 'Pickup Location' : 
                   dbStatus === 'in_transit' ? 'En Route' : 
                   dbStatus === 'completed' ? 'Delivery Location' : 'Processing',
          note: `Status updated to ${dbStatus.replace('_', ' ')}`
        });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryRequests'] });
    },
  });

  const handleApprove = async (id: string): Promise<boolean> => {
    try {
      await approveMutation.mutateAsync(id);
      toast.success('Request approved successfully');
      return true;
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
      return false;
    }
  };

  const handleDecline = async (id: string): Promise<boolean> => {
    try {
      await declineMutation.mutateAsync(id);
      toast.success('Request declined successfully');
      return true;
    } catch (error) {
      console.error('Error declining request:', error);
      toast.error('Failed to decline request');
      return false;
    }
  };

  const handleDeleteRequest = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };
  
  const handleStatusUpdate = async (req: DeliveryRequest, status: 'picked_up' | 'in_transit' | 'delivered'): Promise<boolean> => {
    try {
      await statusUpdateMutation.mutateAsync({ req: req, status: status });
      const displayStatus = status === 'delivered' ? 'completed' : 
                           status === 'picked_up' ? 'picked up' : 
                           status.replace('_', ' ');
      toast.success(`Request status updated to ${displayStatus}`);
      return true;
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error('Failed to update request status');
      return false;
    }
  };

  const handleRequestAction = async (id: string, action: 'approve' | 'decline'): Promise<boolean> => {
    if (action === 'approve') {
      return handleApprove(id);
    } else if (action === 'decline') {
      return handleDecline(id);
    } else {
      console.warn('Unknown action:', action);
      return false;
    }
  };

  return {
    handleDeleteRequest,
    handleRequestAction,
    handleStatusUpdate,
  };
};
