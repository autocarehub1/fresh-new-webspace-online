import React, { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { createPaymentIntent } from '@/lib/stripe';
import { toast } from 'sonner';

interface PaymentFormProps {
  amount: number; // Amount in cents
  onSuccess?: (paymentIntentId: string) => void;
  onCancel?: () => void;
  metadata?: Record<string, any>;
  description?: string;
}

const cardElementOptions = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
  hidePostalCode: true,
};

export const PaymentForm: React.FC<PaymentFormProps> = ({ 
  amount, 
  onSuccess, 
  onCancel,
  metadata = {},
  description = 'Medical Delivery Service'
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [clientSecret, setClientSecret] = useState('');
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

  useEffect(() => {
    // Create PaymentIntent when the page loads
    const fetchPaymentIntent = async () => {
      try {
        const { clientSecret } = await createPaymentIntent(amount, 'usd', metadata);
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Error creating payment intent:', err);
        setError('Failed to initialize payment. Please try again later.');
      }
    };

    fetchPaymentIntent();
  }, [amount, metadata]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Payment processing failed. Please try again.');
      setProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'Customer Name', // This could be passed as a prop
          },
        },
        description,
      });

      if (error) {
        setError(error.message || 'Payment failed. Please try again.');
        toast.error('Payment failed. Please check your card details and try again.');
      } else if (paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        toast.success('Payment successful!');
        if (onSuccess) {
          onSuccess(paymentIntent.id);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Payment processing error. Please try again later.');
    }

    setProcessing(false);
  };

  if (succeeded) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">Payment Successful</h3>
            <p className="text-gray-600 mb-4">
              Your payment of {formattedAmount} has been processed successfully.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Payment</CardTitle>
        <CardDescription>
          Complete your payment of {formattedAmount} to finalize your delivery request
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Card Information</label>
            <div className="border rounded-md p-3 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-xs text-gray-500">
              Your payment information is secured with industry-standard encryption.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={!stripe || processing || !clientSecret}
          >
            {processing ? 'Processing...' : 'Pay Now'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}; 