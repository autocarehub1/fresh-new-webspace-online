
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BrevoEmailRequest {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: { email: string; name: string };
  templateId?: number;
  params?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Brevo email function called");
    const emailRequest: BrevoEmailRequest = await req.json();
    console.log("Email request:", emailRequest);

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

    // Default sender if not provided
    const defaultSender = {
      email: "noreply@yourdomain.com",
      name: "Medical Courier Service"
    };

    const brevoPayload = {
      sender: emailRequest.sender || defaultSender,
      to: emailRequest.to,
      subject: emailRequest.subject,
      htmlContent: emailRequest.htmlContent,
      textContent: emailRequest.textContent || emailRequest.htmlContent.replace(/<[^>]*>/g, ''),
      ...(emailRequest.templateId && { templateId: emailRequest.templateId }),
      ...(emailRequest.params && { params: emailRequest.params })
    };

    console.log("Sending email via Brevo API");
    
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey,
      },
      body: JSON.stringify(brevoPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Brevo API error:", responseData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: responseData }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Email sent successfully via Brevo:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in Brevo email function:", error);
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
