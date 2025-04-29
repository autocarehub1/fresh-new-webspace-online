// Stripe integration utilities
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
// In production, use environment variables for these keys
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'your_test_publishable_key';

// Create a singleton to avoid loading Stripe multiple times
let stripePromise: Promise<any> | null = null;

// Get the Stripe instance
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Function to create a payment intent on the server
export const createPaymentIntent = async (amount: number, currency: string = 'usd', metadata: any = {}) => {
  try {
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
}; 