
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Contact form submission received");
    const request: ContactFormRequest = await req.json();
    console.log("Contact form data:", request);

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

    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      console.error("BREVO_API_KEY not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Brevo API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Send email to admin using Brevo
    const adminEmailPayload = {
      sender: { email: "noreply@catalystnetworklogistics.com", name: "Contact Form" },
      to: [{ email: "catalystlogistics2025@gmail.com", name: "Admin" }],
      subject: `New Contact Form Submission from ${request.name}`,
      htmlContent: `
        <html>
          <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin:0;">New Contact Form Submission</h2>
              </div>
              <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                <table style="width: 100%; margin: 24px 0;">
                  <tr><td style="color: #6B7280;">Name:</td><td style="font-weight: 600;">${request.name}</td></tr>
                  <tr><td style="color: #6B7280;">Email:</td><td>${request.email}</td></tr>
                  <tr><td style="color: #6B7280;">Phone:</td><td>${request.phone || 'Not provided'}</td></tr>
                </table>
                <div style="margin-top: 24px;">
                  <h3 style="color: #6B7280; margin-bottom: 12px;">Message:</h3>
                  <p style="background: #F9FAFB; padding: 16px; border-radius: 6px;">${request.message}</p>
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log("Sending admin email via Brevo API");
    const adminResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(adminEmailPayload),
    });

    if (!adminResponse.ok) {
      const errorData = await adminResponse.json();
      console.error("Brevo API error for admin email:", errorData);
    }

    // Send confirmation email to user using Brevo
    const userEmailPayload = {
      sender: { email: "noreply@catalystnetworklogistics.com", name: "Catalyst Network Logistics" },
      to: [{ email: request.email, name: request.name }],
      subject: "Thank you for contacting us",
      htmlContent: `
        <html>
          <body style="font-family: Arial,sans-serif; background-color: #F9FAFB;">
            <div style="max-width: 600px; margin: 0 auto;">
              <div style="background: #0A2463; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="margin:0;">Thank you for contacting us</h2>
              </div>
              <div style="background: white; padding: 32px; border-radius: 0 0 8px 8px;">
                <p style="font-size: 16px; color: #111827;">We have received your message and will get back to you shortly.</p>
                <div style="margin-top: 24px;">
                  <h3 style="color: #6B7280; margin-bottom: 12px;">Your message:</h3>
                  <p style="background: #F9FAFB; padding: 16px; border-radius: 6px;">${request.message}</p>
                </div>
                <div style="margin-top: 32px; font-size: 12px; color:#6B7280;">
                  If you need immediate assistance, please call us at (432)-202-2150.<br/>
                  Catalyst Network Logistics
                </div>
              </div>
            </div>
          </body>
        </html>
      `,
    };

    console.log("Sending user confirmation email via Brevo API");
    const userResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(userEmailPayload),
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error("Brevo API error for user email:", errorData);
    }

    console.log("Emails sent successfully via Brevo");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error sending contact form emails:", error);
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
