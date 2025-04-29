import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

// Get environment variables
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Stripe
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
});

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verify signature to ensure the webhook is from Stripe
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing stripe-signature header' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get the raw request body
    const rawBody = await req.text();
    
    // Verify the webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed.`, err.message);
      return new Response(JSON.stringify({ error: `Webhook signature verification failed: ${err.message}` }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store the event in the database for reliable processing
    const { data: savedEvent, error: saveError } = await supabase
      .from('payment_webhook_events')
      .insert({
        stripe_event_id: event.id,
        stripe_event_type: event.type,
        event_data: event,
        processed: false
      })
      .select();

    if (saveError) {
      console.error('Error saving webhook event:', saveError);
      return new Response(JSON.stringify({ error: 'Error saving webhook event' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Process based on event type
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
      // Add other event types as needed
    }

    // Mark the event as processed
    await supabase
      .from('payment_webhook_events')
      .update({ processed: true })
      .eq('stripe_event_id', event.id);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new Response(JSON.stringify({ error: 'Webhook handler failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    // Update payment record in the database
    const { data: payments, error: paymentError } = await supabase
      .from('payments')
      .insert({
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        payment_method: paymentIntent.payment_method_types[0],
        request_id: paymentIntent.metadata.requestId // Assuming you pass this in metadata
      })
      .select();

    if (paymentError) {
      throw paymentError;
    }

    // Update the delivery request status
    if (paymentIntent.metadata.requestId) {
      const { error: requestError } = await supabase
        .from('delivery_requests')
        .update({
          payment_status: 'completed',
          payment_id: paymentIntent.id
        })
        .eq('id', paymentIntent.metadata.requestId);

      if (requestError) {
        throw requestError;
      }
    }

    console.log(`✅ Payment for ${paymentIntent.id} processed successfully`);
  } catch (error) {
    console.error('Error processing payment success:', error);
    // Update webhook event with error
    await supabase
      .from('payment_webhook_events')
      .update({
        processing_error: error.message
      })
      .eq('stripe_event_id', paymentIntent.id);
  }
}

async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    // Record the failed payment
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: 'failed',
        payment_method: paymentIntent.payment_method_types[0],
        request_id: paymentIntent.metadata.requestId
      });

    if (paymentError) {
      throw paymentError;
    }

    // Update the delivery request
    if (paymentIntent.metadata.requestId) {
      const { error: requestError } = await supabase
        .from('delivery_requests')
        .update({
          payment_status: 'failed'
        })
        .eq('id', paymentIntent.metadata.requestId);

      if (requestError) {
        throw requestError;
      }
    }

    console.log(`❌ Payment for ${paymentIntent.id} failed`);
  } catch (error) {
    console.error('Error processing payment failure:', error);
    await supabase
      .from('payment_webhook_events')
      .update({
        processing_error: error.message
      })
      .eq('stripe_event_id', paymentIntent.id);
  }
} 