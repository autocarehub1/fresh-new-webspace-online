
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeliveryRequest {
  id: string;
  trackingId: string;
  pickup_location: string;
  delivery_location: string;
  priority: string;
  package_type: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: DeliveryRequest = await req.json();
    console.log("Sending confirmation email for request:", request);

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

    const emailResponse = await resend.emails.send({
      from: "Medical Courier Service <onboarding@resend.dev>",
      to: [request.email],
      subject: `Delivery Request Confirmation - ${request.trackingId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6; background-color: #F9FAFB;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background-color: #0A2463; padding: 20px; border-radius: 8px 8px 0 0;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; text-align: center;">Delivery Request Confirmation</h1>
              </div>
              
              <div style="background-color: #ffffff; padding: 32px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
                  Thank you for choosing our Medical Courier Service. Your request has been successfully submitted and is being processed.
                </p>
                
                <div style="background-color: #F3F4F6; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                  <h2 style="color: #1F2937; font-size: 18px; margin: 0 0 16px 0;">Request Details</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280; width: 140px;">Tracking ID:</td>
                      <td style="padding: 8px 0; color: #111827; font-weight: 600;">${request.trackingId}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Request ID:</td>
                      <td style="padding: 8px 0; color: #111827; font-weight: 600;">${request.id}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Pickup:</td>
                      <td style="padding: 8px 0; color: #111827;">${request.pickup_location}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Delivery:</td>
                      <td style="padding: 8px 0; color: #111827;">${request.delivery_location}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Priority:</td>
                      <td style="padding: 8px 0; color: #111827;">${request.priority}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #6B7280;">Package Type:</td>
                      <td style="padding: 8px 0; color: #111827;">${request.package_type}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="text-align: center; margin-top: 32px;">
                  <a href="/tracking?id=${request.trackingId}" 
                     style="display: inline-block; background-color: #3E92CC; color: #ffffff; padding: 12px 24px; 
                            text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Track Your Delivery
                  </a>
                </div>
                
                <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E5E7EB;">
                  <p style="color: #6B7280; font-size: 14px; margin: 0; text-align: center;">
                    If you have any questions, please contact our support team at support@medicalcourier.com<br>
                    Available 24/7 for urgent medical deliveries
                  </p>
                </div>
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
    console.error("Error sending confirmation email:", error);
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
