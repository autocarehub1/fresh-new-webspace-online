
import { DeliveryRequest } from '@/types/delivery';

export const createRequest = async (request: DeliveryRequest): Promise<any> => {
  try {
    // Mock implementation for now
    console.log('Creating request:', request);
    return { success: true };
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};
