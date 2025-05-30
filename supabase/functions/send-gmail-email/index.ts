
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GmailEmailRequest {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: { email: string; name: string };
  type?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Gmail email function called");
    const emailRequest: GmailEmailRequest = await req.json();
    console.log("Email request:", emailRequest);

    // Get Gmail credentials from Supabase secrets
    const gmailEmail = Deno.env.get("GMAIL_EMAIL") || "catnetlogistics@gmail.com";
    const gmailPassword = Deno.env.get("GMAIL_PASSWORD");
    
    if (!gmailPassword) {
      console.error("Gmail password not found in environment variables");
      return new Response(
        JSON.stringify({ error: "Gmail credentials not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Default sender if not provided
    const defaultSender = {
      email: gmailEmail,
      name: "Catalyst Network Logistics"
    };

    const sender = emailRequest.sender || defaultSender;
    const textContent = emailRequest.textContent || emailRequest.htmlContent.replace(/<[^>]*>/g, '');

    console.log("Sending email via Gmail SMTP");

    // Create SMTP client
    const client = new SmtpClient();

    // Connect to Gmail SMTP
    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 587,
      username: gmailEmail,
      password: gmailPassword,
    });

    // Send email to each recipient
    for (const recipient of emailRequest.to) {
      await client.send({
        from: sender.email,
        to: recipient.email,
        subject: emailRequest.subject,
        content: textContent,
        html: emailRequest.htmlContent,
      });
      console.log(`Email sent to: ${recipient.email}`);
    }

    // Close SMTP connection
    await client.close();

    const responseData = {
      messageId: `gmail-${Date.now()}`,
      status: "sent",
      timestamp: new Date().toISOString(),
      recipients: emailRequest.to.length
    };

    console.log("Email sent successfully via Gmail:", responseData);

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in Gmail email function:", error);
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
