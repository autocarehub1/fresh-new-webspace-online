# Stripe Integration Setup

This guide will help you set up Stripe payments in your Express Med Dispatch application.

## Prerequisites

1. A Stripe account (create one at [stripe.com](https://stripe.com))
2. Supabase project (for database and edge functions)

## Setup Steps

### 1. Stripe Account Setup

1. Sign up or log in to your Stripe account
2. Navigate to the Developers section
3. Get your API keys (both publishable and secret)
4. Set up webhook endpoints

### 2. Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
# Stripe API Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
STRIPE_SECRET_KEY=sk_test_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Config (for Edge Functions)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Deploy Supabase Edge Functions

Navigate to the `supabase/functions` directory and deploy the edge functions:

```
supabase functions deploy create-payment-intent
supabase functions deploy stripe-webhook
```

### 4. Database Migration

Run the SQL migration to add payment-related tables:

```
supabase db push
```

This will add the necessary payment tables to your Supabase database.

### 5. Configure Stripe Webhook

1. In your Stripe Dashboard, go to Developers > Webhooks
2. Add a new webhook endpoint with the URL: `https://[your-project-id].supabase.co/functions/v1/stripe-webhook`
3. Add the following events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.created`

### 6. Testing

1. Use Stripe's test cards to test the payment flow:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0000 0000 3220`
2. Check the Stripe dashboard for test events and payments
3. Verify that payment records are being created in your Supabase database

## Troubleshooting

- Check Supabase Edge Function logs for any errors
- Verify webhook events are being received by checking the Stripe dashboard
- Ensure all environment variables are correctly set

## Production Considerations

When moving to production:

1. Switch to production Stripe API keys
2. Update webhook endpoints to use production URLs
3. Test the complete payment flow in a staging environment
4. Implement proper error handling and recovery mechanisms
5. Set up Stripe alerts for failed payments
6. Consider adding a retry mechanism for failed webhooks 