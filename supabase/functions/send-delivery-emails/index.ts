
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeliveryEmailRequest {
  type: 'confirmation' | 'completion';
  requestData?: {
    requestId: string;
    trackingId: string;
    customerName: string;
    customerEmail: string;
    pickupLocation: string;
    deliveryLocation: string;
    serviceType: string;
    priority: string;
    specialInstructions?: string;
    estimatedDelivery?: string;
  };
  completionData?: {
    requestId: string;
    trackingId: string;
    customerName: string;
    customerEmail: string;
    pickupLocation: string;
    deliveryLocation: string;
    completedAt: string;
    deliveryPhotoUrl?: string;
    driverName?: string;
  };
}

const generateConfirmationEmail = (data: any) => {
  const subject = `Delivery Request Confirmed - ${data.trackingId}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #0A2463 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .details-card { background: #f8fafc; border-left: 4px solid #0A2463; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .priority-urgent { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .priority-normal { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
        .tracking-section { background: #0A2463; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
        .tracking-id { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
        .btn { display: inline-block; background: #0A2463; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Delivery Request Confirmed</h1>
          <p>Thank you for choosing Catalyst Network Logistics</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Your delivery request has been successfully submitted and confirmed. Our team will process your request and assign a driver shortly.</p>
          
          <div class="tracking-section">
            <h3>Your Tracking Information</h3>
            <div class="tracking-id">${data.trackingId}</div>
            <p>Save this tracking ID for future reference</p>
          </div>
          
          <div class="details-card">
            <h3>Request Details</h3>
            <div class="detail-row">
              <span>Request ID:</span>
              <span>${data.requestId}</span>
            </div>
            <div class="detail-row">
              <span>Service Type:</span>
              <span>${data.serviceType}</span>
            </div>
            <div class="detail-row">
              <span>Priority:</span>
              <span class="${data.priority === 'urgent' ? 'priority-urgent' : 'priority-normal'}">
                ${data.priority.toUpperCase()}
              </span>
            </div>
            <div class="detail-row">
              <span>Pickup Location:</span>
              <span>${data.pickupLocation}</span>
            </div>
            <div class="detail-row">
              <span>Delivery Location:</span>
              <span>${data.deliveryLocation}</span>
            </div>
            ${data.estimatedDelivery ? `
            <div class="detail-row">
              <span>Estimated Delivery:</span>
              <span>${data.estimatedDelivery}</span>
            </div>
            ` : ''}
            ${data.specialInstructions ? `
            <div class="detail-row">
              <span>Special Instructions:</span>
              <span>${data.specialInstructions}</span>
            </div>
            ` : ''}
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Catalyst Network Logistics. All rights reserved.</p>
          <p>Email: catnetlogistics@gmail.com | Phone: (432) 202-2150</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Catalyst Network Logistics - Delivery Request Confirmed

Dear ${data.customerName},

Your delivery request has been successfully submitted and confirmed.

TRACKING INFORMATION:
Tracking ID: ${data.trackingId}
Request ID: ${data.requestId}

REQUEST DETAILS:
- Service Type: ${data.serviceType}
- Priority: ${data.priority.toUpperCase()}
- Pickup: ${data.pickupLocation}
- Delivery: ${data.deliveryLocation}
${data.estimatedDelivery ? `- Estimated Delivery: ${data.estimatedDelivery}` : ''}
${data.specialInstructions ? `- Special Instructions: ${data.specialInstructions}` : ''}

Thank you for choosing Catalyst Network Logistics!
Contact us: catnetlogistics@gmail.com | (432) 202-2150
  `;

  return { subject, htmlContent, textContent };
};

const generateCompletionEmail = (data: any) => {
  const subject = `Delivery Completed - ${data.trackingId}`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px 20px; text-align: center; }
        .content { padding: 30px 20px; }
        .completion-badge { background: #10b981; color: white; padding: 15px 25px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
        .details-card { background: #f8fafc; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .photo-section { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #d1d5db; }
        .delivery-photo { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
        .success-icon { font-size: 48px; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="success-icon">✅</div>
          <h1>Delivery Completed Successfully!</h1>
          <p>Your package has been delivered</p>
        </div>
        
        <div class="content">
          <p>Dear ${data.customerName},</p>
          <p>Great news! Your delivery has been completed successfully. Thank you for choosing Catalyst Network Logistics for your delivery needs.</p>
          
          <div style="text-align: center;">
            <span class="completion-badge">DELIVERY COMPLETED</span>
          </div>
          
          <div class="details-card">
            <h3>Delivery Summary</h3>
            <div class="detail-row">
              <span>Tracking ID:</span>
              <span>${data.trackingId}</span>
            </div>
            <div class="detail-row">
              <span>Request ID:</span>
              <span>${data.requestId}</span>
            </div>
            <div class="detail-row">
              <span>Pickup Location:</span>
              <span>${data.pickupLocation}</span>
            </div>
            <div class="detail-row">
              <span>Delivery Location:</span>
              <span>${data.deliveryLocation}</span>
            </div>
            <div class="detail-row">
              <span>Completed At:</span>
              <span>${new Date(data.completedAt).toLocaleString()}</span>
            </div>
            ${data.driverName ? `
            <div class="detail-row">
              <span>Driver:</span>
              <span>${data.driverName}</span>
            </div>
            ` : ''}
          </div>
          
          ${data.deliveryPhotoUrl ? `
          <div class="photo-section">
            <h3>Proof of Delivery</h3>
            <img src="${data.deliveryPhotoUrl}" alt="Delivery Photo" class="delivery-photo" />
            <p>Photo taken at time of delivery for your records</p>
          </div>
          ` : ''}
          
          <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #a7f3d0;">
            <h4>Thank you for your business!</h4>
            <p>We hope you're satisfied with our service. If you have any questions about this delivery or need to schedule another one, please don't hesitate to contact us.</p>
          </div>
        </div>
        
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Catalyst Network Logistics. All rights reserved.</p>
          <p>Email: catnetlogistics@gmail.com | Phone: (432) 202-2150</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Catalyst Network Logistics - Delivery Completed Successfully!

Dear ${data.customerName},

Great news! Your delivery has been completed successfully.

DELIVERY SUMMARY:
- Tracking ID: ${data.trackingId}
- Request ID: ${data.requestId}
- Pickup: ${data.pickupLocation}
- Delivery: ${data.deliveryLocation}
- Completed: ${new Date(data.completedAt).toLocaleString()}
${data.driverName ? `- Driver: ${data.driverName}` : ''}

${data.deliveryPhotoUrl ? `PROOF OF DELIVERY:
Photo available at: ${data.deliveryPhotoUrl}` : ''}

Thank you for choosing Catalyst Network Logistics!
Contact us: catnetlogistics@gmail.com | (432) 202-2150
  `;

  return { subject, htmlContent, textContent };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Delivery email function called");
    const emailRequest: DeliveryEmailRequest = await req.json();
    console.log("Email request type:", emailRequest.type);

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let emailData;
    let subject: string;
    let htmlContent: string;
    let textContent: string;

    if (emailRequest.type === 'confirmation' && emailRequest.requestData) {
      const result = generateConfirmationEmail(emailRequest.requestData);
      subject = result.subject;
      htmlContent = result.htmlContent;
      textContent = result.textContent;
      emailData = emailRequest.requestData;
    } else if (emailRequest.type === 'completion' && emailRequest.completionData) {
      const result = generateCompletionEmail(emailRequest.completionData);
      subject = result.subject;
      htmlContent = result.htmlContent;
      textContent = result.textContent;
      emailData = emailRequest.completionData;
    } else {
      throw new Error('Invalid email request type or missing data');
    }

    // Call the Gmail function to send the email
    const { data, error } = await supabase.functions.invoke('send-gmail-email', {
      body: {
        to: [{ email: emailData.customerEmail, name: emailData.customerName }],
        subject,
        htmlContent,
        textContent,
        sender: {
          email: "catnetlogistics@gmail.com",
          name: "Catalyst Network Logistics"
        },
        type: emailRequest.type
      }
    });

    if (error) {
      console.error('Error calling Gmail function:', error);
      throw error;
    }

    console.log('Email sent successfully:', data);

    return new Response(JSON.stringify({
      success: true,
      messageId: data?.messageId,
      type: emailRequest.type,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("Error in delivery email function:", error);
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
