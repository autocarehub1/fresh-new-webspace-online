
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  id: string;
  trackingId?: string;
  pickup_location?: string;
  delivery_location?: string;
  priority?: string;
  package_type?: string;
  email: string;
  status: string;
  status_note?: string;
  assigned_driver?: string;
  driver_name?: string;
}

const statusSubjectMapping: Record<string, string> = {
  'pending': 'Delivery Request Submitted',
  'approved': 'Delivery Request Approved',
  'in_progress': 'Package Picked Up',
  'completed': 'Delivery Completed',
  'declined': 'Delivery Request Declined',
  'picked_up': 'Package Picked Up',
  'in_transit': 'Package In Transit',
  'delivered': 'Package Delivered',
  'driver_welcome': 'Welcome to Medical Courier Service'
};

const statusNoteDefault: Record<string, string> = {
  'pending': 'Your delivery request has been submitted and is awaiting approval.',
  'approved': 'Your delivery request has been approved and will be assigned to a driver soon.',
  'in_progress': 'Your package has been picked up and is now in progress.',
  'completed': 'Your delivery has been completed.',
  'declined': 'Your delivery request was declined.',
  'picked_up': 'The courier has picked up your package.',
  'in_transit': 'Your package is in transit to its destination.',
  'delivered': 'Your package has been delivered.',
  'driver_welcome': 'Welcome to our driver network! Your account has been set up successfully.'
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Send confirmation function called");
    const request: EmailRequest = await req.json();
    console.log("Sending email for request status:", request);

    if (!request.email) {
      console.error("No recipient email provided");
      return new Response(
        JSON.stringify({ error: "No recipient email provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get status subject/note or use a default
    const subject =
      statusSubjectMapping[request.status] ||
      `Delivery Status Update: ${request.status}`;
    const note =
      request.status_note ||
      statusNoteDefault[request.status] ||
      "There has been a status update on your delivery.";

    // Extract base URL from referer
    let baseUrl = "https://joziqntfciyflfsgvsqz.supabase.co";
    try {
      const referer = req.headers.get('referer');
      if (referer) {
        const url = new URL(referer);
        baseUrl = `${url.protocol}//${url.host}`;
      }
    } catch (error) {
      console.log("Error parsing referer:", error);
      // fallback to default URL
    }

    const trackingUrl = request.trackingId
      ? `${baseUrl}/tracking?id=${request.trackingId}`
      : baseUrl;

    console.log("Prepared email with subject:", subject);
    console.log("Tracking URL:", trackingUrl);
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("Using Resend API key:", resendApiKey ? "API key found" : "API key missing");

    // Handle driver welcome email differently
    if (request.status === 'driver_welcome') {
      const emailResponse = await resend.emails.send({
        from: "Medical Courier Service <onboarding@resend.dev>",
        to: [request.email],
        subject: subject,
        html: `
          <html>
            <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
              <div style="max-width: 600px; margin: 0 auto;">
                <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                  <h2 style="margin:0;">Welcome to Medical Courier Service!</h2>
                </div>
                <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                  <p style="font-size: 16px; color: #111827;">Hello ${request.driver_name || 'Driver'},</p>
                  <p style="font-size: 16px; color: #111827;">${note}</p>
                  <p style="font-size: 16px; color: #111827;">Your driver profile has been created and is currently under review. You will receive another email once your account is approved.</p>
                  <div style="text-align:center;margin-top:32px;">
                    <a href="${baseUrl}/driver-portal" style="background:#3E92CC;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
                      Access Driver Portal
                    </a>
                  </div>
                  <div style="margin-top: 32px; font-size: 12px; color:#6B7280;">If you have questions, reply to this email.<br/>Medical Courier Service Driver Support</div>
                </div>
              </div>
            </body>
          </html>
        `,
      });

      console.log("Driver welcome email sent successfully:", emailResponse);
      return new Response(JSON.stringify(emailResponse), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Send the delivery status email
    const emailResponse = await resend.emails.send({
      from: "Medical Courier Service <onboarding@resend.dev>",
      to: [request.email],
      subject: subject,
      html: `
        <html>
          <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin:0;">${subject}</h2>
              </div>
              <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #111827;">${note}</p>
                <table style="width: 100%; margin: 24px 0;">
                  ${request.trackingId ? `
                  <tr><td style="color: #6B7280;">Tracking ID:</td><td style="font-weight: 600;">${request.trackingId}</td></tr>
                  ` : ""}
                  ${request.pickup_location ? `
                  <tr><td style="color: #6B7280;">Pickup:</td><td>${request.pickup_location}</td></tr>
                  ` : ""}
                  ${request.delivery_location ? `
                  <tr><td style="color: #6B7280;">Delivery:</td><td>${request.delivery_location}</td></tr>
                  ` : ""}
                  ${request.assigned_driver ? `
                  <tr><td style="color: #6B7280;">Courier:</td><td>${request.assigned_driver}</td></tr>
                  ` : ""}
                </table>
                ${request.trackingId ? `
                  <div style="text-align:center;margin-top:32px;">
                    <a href="${trackingUrl}" style="background:#3E92CC;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:600;">
                      Track Your Delivery
                    </a>
                  </div>
                ` : ""}
                <div style="margin-top: 32px; font-size: 12px; color:#6B7280;">If you have questions, reply to this email.<br/>Medical Courier Service</div>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error sending status change email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
