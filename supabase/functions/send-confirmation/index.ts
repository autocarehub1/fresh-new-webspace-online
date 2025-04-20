
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: DeliveryRequest = await req.json();
    console.log("Sending confirmation email for request:", request);

    const emailResponse = await resend.emails.send({
      from: "Medical Courier Service <onboarding@resend.dev>",
      to: ["recipient@example.com"], // This will be replaced with the actual recipient email
      subject: `Delivery Request Confirmation - ${request.trackingId}`,
      html: `
        <h1>Your Delivery Request Has Been Received</h1>
        <p>Thank you for choosing our Medical Courier Service. Your request has been successfully submitted.</p>
        
        <h2>Request Details:</h2>
        <ul>
          <li><strong>Tracking ID:</strong> ${request.trackingId}</li>
          <li><strong>Request ID:</strong> ${request.id}</li>
          <li><strong>Pickup Location:</strong> ${request.pickup_location}</li>
          <li><strong>Delivery Location:</strong> ${request.delivery_location}</li>
          <li><strong>Priority:</strong> ${request.priority}</li>
          <li><strong>Package Type:</strong> ${request.package_type}</li>
        </ul>
        
        <p>You can track your delivery status using your tracking ID: ${request.trackingId}</p>
        <p>Track your delivery here: <a href="https://your-domain.com/tracking?id=${request.trackingId}">Track Delivery</a></p>
        
        <p>If you have any questions, please contact our support team.</p>
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
