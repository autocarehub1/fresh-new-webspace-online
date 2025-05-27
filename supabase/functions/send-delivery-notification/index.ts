
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { deliveryId, status, recipientEmail, additionalData } = await req.json();

    // Get delivery details
    const { data: delivery, error: deliveryError } = await supabaseClient
      .from('delivery_requests')
      .select('*, driver:assigned_driver(name, phone)')
      .eq('id', deliveryId)
      .single();

    if (deliveryError) throw deliveryError;

    // Prepare email content based on status
    let subject = '';
    let htmlContent = '';

    switch (status) {
      case 'in_progress':
        subject = `Your delivery is on the way - ${delivery.tracking_id}`;
        htmlContent = `
          <h2>Delivery Update</h2>
          <p>Your delivery <strong>${delivery.tracking_id}</strong> is now in progress.</p>
          <p><strong>Driver:</strong> ${delivery.driver?.name || 'Assigned'}</p>
          <p><strong>From:</strong> ${delivery.pickup_location}</p>
          <p><strong>To:</strong> ${delivery.delivery_location}</p>
          <p>You can track your delivery in real-time using your tracking ID.</p>
        `;
        break;
      case 'completed':
        subject = `Delivery completed - ${delivery.tracking_id}`;
        htmlContent = `
          <h2>Delivery Completed!</h2>
          <p>Your delivery <strong>${delivery.tracking_id}</strong> has been successfully completed.</p>
          <p><strong>Delivered to:</strong> ${delivery.delivery_location}</p>
          <p><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
          ${additionalData?.proofUrl ? `<p><a href="${additionalData.proofUrl}">View Proof of Delivery</a></p>` : ''}
        `;
        break;
      default:
        subject = `Delivery status update - ${delivery.tracking_id}`;
        htmlContent = `
          <h2>Delivery Status Update</h2>
          <p>Your delivery <strong>${delivery.tracking_id}</strong> status has been updated to: <strong>${status}</strong></p>
        `;
    }

    // Send email using your preferred email service
    // This is a placeholder - integrate with your email provider
    console.log('Sending email:', { recipientEmail, subject, htmlContent });

    // Log the notification
    await supabaseClient.from('notification_logs').insert({
      delivery_id: deliveryId,
      recipient_email: recipientEmail,
      notification_type: 'email',
      status: 'sent',
      content: { subject, status }
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Email notification sent' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
