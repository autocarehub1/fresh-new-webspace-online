
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
      const { data, error } = await supabase
        .from('delivery_requests')
        .update({ status: status })
        .eq('id', req.id);
      
      if (error) {
        throw error;
      }
      
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
  
  const handleStatusUpdate = async (req: DeliveryRequest, status: 'picked_up' | 'in_transit' | 'delivered' | 'reset_to_pending'): Promise<boolean> => {
    let newStatus: string;
    
    switch (status) {
      case 'picked_up':
        newStatus = 'in_progress';
        break;
      case 'in_transit':
        newStatus = 'in_progress';
        break;
      case 'delivered':
        newStatus = 'completed';
        break;
      case 'reset_to_pending':
        newStatus = 'pending';
        break;
      default:
        console.warn('Unknown status:', status);
        return false;
    }
    
    try {
      await statusUpdateMutation.mutateAsync({ req: req, status: newStatus });
      toast.success(`Request status updated to ${newStatus}`);
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
