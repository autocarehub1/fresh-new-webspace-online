
export interface RequestEmailData {
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
}

export interface DeliveryCompletionEmailData {
  requestId: string;
  trackingId: string;
  customerName: string;
  customerEmail: string;
  pickupLocation: string;
  deliveryLocation: string;
  completedAt: string;
  deliveryPhotoUrl?: string;
  driverName?: string;
  driverSignature?: string;
}

export class EmailTemplateService {
  private static readonly COMPANY_LOGO_URL = "https://joziqntfciyflfsgvsqz.supabase.co/storage/v1/object/public/company-assets/catalyst-logo.png";
  private static readonly COMPANY_NAME = "Catalyst Network Logistics";
  private static readonly COMPANY_PHONE = "(432) 202-2150";
  private static readonly COMPANY_EMAIL = "catnetlogistics@gmail.com";
  private static readonly WEBSITE_URL = window.location.origin;

  static generateRequestConfirmationEmail(data: RequestEmailData): { subject: string; htmlContent: string; textContent: string } {
    const subject = `Delivery Request Confirmed - ${data.trackingId}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #0A2463 0%, #1e40af 100%); color: white; padding: 30px 20px; text-align: center; }
          .logo { max-width: 150px; height: auto; margin-bottom: 15px; }
          .content { padding: 30px 20px; }
          .details-card { background: #f8fafc; border-left: 4px solid #0A2463; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: 600; color: #475569; }
          .detail-value { color: #1e293b; text-align: right; }
          .priority-urgent { background: #fee2e2; color: #dc2626; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .priority-normal { background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
          .tracking-section { background: #0A2463; color: white; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; }
          .tracking-id { font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
          .btn { display: inline-block; background: #0A2463; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .contact-info { margin: 15px 0; }
          @media (max-width: 600px) {
            .detail-row { flex-direction: column; }
            .detail-value { text-align: left; margin-top: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${this.COMPANY_LOGO_URL}" alt="${this.COMPANY_NAME}" class="logo" />
            <h1 style="margin: 0; font-size: 24px;">Delivery Request Confirmed</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for choosing ${this.COMPANY_NAME}</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Your delivery request has been successfully submitted and confirmed. Our team will process your request and assign a driver shortly.</p>
            
            <div class="tracking-section">
              <h3 style="margin: 0 0 10px 0;">Your Tracking Information</h3>
              <div class="tracking-id">${data.trackingId}</div>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Save this tracking ID for future reference</p>
            </div>
            
            <div class="details-card">
              <h3 style="margin: 0 0 15px 0; color: #0A2463;">Request Details</h3>
              <div class="detail-row">
                <span class="detail-label">Request ID:</span>
                <span class="detail-value">${data.requestId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service Type:</span>
                <span class="detail-value">${data.serviceType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Priority:</span>
                <span class="detail-value">
                  <span class="${data.priority === 'urgent' ? 'priority-urgent' : 'priority-normal'}">
                    ${data.priority.toUpperCase()}
                  </span>
                </span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pickup Location:</span>
                <span class="detail-value">${data.pickupLocation}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Delivery Location:</span>
                <span class="detail-value">${data.deliveryLocation}</span>
              </div>
              ${data.estimatedDelivery ? `
              <div class="detail-row">
                <span class="detail-label">Estimated Delivery:</span>
                <span class="detail-value">${data.estimatedDelivery}</span>
              </div>
              ` : ''}
              ${data.specialInstructions ? `
              <div class="detail-row">
                <span class="detail-label">Special Instructions:</span>
                <span class="detail-value">${data.specialInstructions}</span>
              </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.WEBSITE_URL}/tracking?id=${data.trackingId}" class="btn">Track Your Delivery</a>
              <a href="${this.WEBSITE_URL}/request-pickup" class="btn" style="background: #6b7280;">Request Another Delivery</a>
            </div>
            
            <div style="background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #0369a1;">What happens next?</h4>
              <ol style="margin: 0; padding-left: 20px; color: #374151;">
                <li>We'll review and approve your request (typically within 30 minutes)</li>
                <li>A qualified driver will be assigned to your delivery</li>
                <li>You'll receive real-time updates via email and SMS</li>
                <li>Track your delivery progress using the link above</li>
              </ol>
            </div>
          </div>
          
          <div class="footer">
            <div class="contact-info">
              <strong>${this.COMPANY_NAME}</strong><br>
              Email: ${this.COMPANY_EMAIL} | Phone: ${this.COMPANY_PHONE}<br>
              Web: <a href="${this.WEBSITE_URL}" style="color: #0A2463;">${this.WEBSITE_URL}</a>
            </div>
            <p>&copy; ${new Date().getFullYear()} ${this.COMPANY_NAME}. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
${this.COMPANY_NAME} - Delivery Request Confirmed

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

WHAT'S NEXT:
1. We'll review and approve your request (typically within 30 minutes)
2. A qualified driver will be assigned to your delivery
3. You'll receive real-time updates via email and SMS
4. Track your delivery at: ${this.WEBSITE_URL}/tracking?id=${data.trackingId}

Contact us: ${this.COMPANY_EMAIL} | ${this.COMPANY_PHONE}

Thank you for choosing ${this.COMPANY_NAME}!
    `;

    return { subject, htmlContent, textContent };
  }

  static generateDeliveryCompletionEmail(data: DeliveryCompletionEmailData): { subject: string; htmlContent: string; textContent: string } {
    const subject = `Delivery Completed - ${data.trackingId}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; padding: 30px 20px; text-align: center; }
          .logo { max-width: 150px; height: auto; margin-bottom: 15px; }
          .content { padding: 30px 20px; }
          .completion-badge { background: #10b981; color: white; padding: 15px 25px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 20px 0; }
          .details-card { background: #f8fafc; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .detail-label { font-weight: 600; color: #475569; }
          .detail-value { color: #1e293b; text-align: right; }
          .photo-section { background: #f9fafb; padding: 20px; margin: 20px 0; border-radius: 8px; text-align: center; border: 2px dashed #d1d5db; }
          .delivery-photo { max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .btn { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; }
          .success-icon { font-size: 48px; margin-bottom: 10px; }
          @media (max-width: 600px) {
            .detail-row { flex-direction: column; }
            .detail-value { text-align: left; margin-top: 5px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${this.COMPANY_LOGO_URL}" alt="${this.COMPANY_NAME}" class="logo" />
            <div class="success-icon">✅</div>
            <h1 style="margin: 0; font-size: 24px;">Delivery Completed Successfully!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your package has been delivered</p>
          </div>
          
          <div class="content">
            <p>Dear ${data.customerName},</p>
            <p>Great news! Your delivery has been completed successfully. Thank you for choosing ${this.COMPANY_NAME} for your delivery needs.</p>
            
            <div style="text-align: center;">
              <span class="completion-badge">DELIVERY COMPLETED</span>
            </div>
            
            <div class="details-card">
              <h3 style="margin: 0 0 15px 0; color: #10b981;">Delivery Summary</h3>
              <div class="detail-row">
                <span class="detail-label">Tracking ID:</span>
                <span class="detail-value">${data.trackingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Request ID:</span>
                <span class="detail-value">${data.requestId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pickup Location:</span>
                <span class="detail-value">${data.pickupLocation}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Delivery Location:</span>
                <span class="detail-value">${data.deliveryLocation}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Completed At:</span>
                <span class="detail-value">${new Date(data.completedAt).toLocaleString()}</span>
              </div>
              ${data.driverName ? `
              <div class="detail-row">
                <span class="detail-label">Driver:</span>
                <span class="detail-value">${data.driverName}</span>
              </div>
              ` : ''}
            </div>
            
            ${data.deliveryPhotoUrl ? `
            <div class="photo-section">
              <h3 style="margin: 0 0 15px 0; color: #374151;">Proof of Delivery</h3>
              <img src="${data.deliveryPhotoUrl}" alt="Delivery Photo" class="delivery-photo" />
              <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">
                Photo taken at time of delivery for your records
              </p>
            </div>
            ` : ''}
            
            <div style="background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #a7f3d0;">
              <h4 style="margin: 0 0 10px 0; color: #065f46;">Thank you for your business!</h4>
              <p style="margin: 0; color: #374151;">
                We hope you're satisfied with our service. If you have any questions about this delivery 
                or need to schedule another one, please don't hesitate to contact us.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${this.WEBSITE_URL}/request-pickup" class="btn">Schedule Another Delivery</a>
              <a href="${this.WEBSITE_URL}/tracking?id=${data.trackingId}" class="btn" style="background: #6b7280;">View Full Tracking History</a>
            </div>
          </div>
          
          <div class="footer">
            <div style="margin: 15px 0;">
              <strong>${this.COMPANY_NAME}</strong><br>
              Email: ${this.COMPANY_EMAIL} | Phone: ${this.COMPANY_PHONE}<br>
              Web: <a href="${this.WEBSITE_URL}" style="color: #10b981;">${this.WEBSITE_URL}</a>
            </div>
            <p>&copy; ${new Date().getFullYear()} ${this.COMPANY_NAME}. All rights reserved.</p>
            <p>This is an automated delivery confirmation. Please save this email for your records.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
${this.COMPANY_NAME} - Delivery Completed Successfully!

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

Thank you for choosing ${this.COMPANY_NAME}!

Schedule another delivery: ${this.WEBSITE_URL}/request-pickup
View tracking history: ${this.WEBSITE_URL}/tracking?id=${data.trackingId}

Contact us: ${this.COMPANY_EMAIL} | ${this.COMPANY_PHONE}
    `;

    return { subject, htmlContent, textContent };
  }
}
