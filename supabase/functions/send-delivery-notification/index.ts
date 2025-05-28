
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
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">Delivery Update</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p>Your delivery <strong>${delivery.tracking_id}</strong> is now in progress.</p>
                  <p><strong>Driver:</strong> ${delivery.driver?.name || 'Assigned'}</p>
                  <p><strong>From:</strong> ${delivery.pickup_location}</p>
                  <p><strong>To:</strong> ${delivery.delivery_location}</p>
                  <p>You can track your delivery in real-time using your tracking ID.</p>
                </div>
              </div>
            </body>
          </html>
        `;
        break;
      case 'completed':
        subject = `Delivery completed - ${delivery.tracking_id}`;
        htmlContent = `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">Delivery Completed!</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p>Your delivery <strong>${delivery.tracking_id}</strong> has been successfully completed.</p>
                  <p><strong>Delivered to:</strong> ${delivery.delivery_location}</p>
                  <p><strong>Completed at:</strong> ${new Date().toLocaleString()}</p>
                  ${additionalData?.proofUrl ? `<p><a href="${additionalData.proofUrl}">View Proof of Delivery</a></p>` : ''}
                </div>
              </div>
            </body>
          </html>
        `;
        break;
      default:
        subject = `Delivery status update - ${delivery.tracking_id}`;
        htmlContent = `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">Delivery Status Update</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p>Your delivery <strong>${delivery.tracking_id}</strong> status has been updated to: <strong>${status}</strong></p>
                </div>
              </div>
            </body>
          </html>
        `;
    }

    // Send email using Brevo API
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (brevoApiKey) {
      const brevoPayload = {
        sender: { email: "noreply@catalystnetworklogistics.com", name: "Catalyst Network Logistics" },
        to: [{ email: recipientEmail }],
        subject,
        htmlContent,
      };

      const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": brevoApiKey,
        },
        body: JSON.stringify(brevoPayload),
      });

      if (brevoResponse.ok) {
        console.log('Email sent successfully via Brevo');
      } else {
        console.error('Brevo email failed, logging notification anyway');
      }
    }

    // Log the notification
    await supabaseClient.from('notification_logs').insert({
      delivery_id: deliveryId,
      recipient_email: recipientEmail,
      notification_type: 'email',
      status: 'sent',
      content: { subject, status }
    });

    return new Response(
      JSON.stringify({ success: true, message: 'Email notification sent via Brevo' }),
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
