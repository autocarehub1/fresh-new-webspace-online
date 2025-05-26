import React, { useEffect, useState, Suspense, lazy } from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FileText, Download, Calendar, ArrowRight, Plus, RotateCw, ArrowDown, ArrowUp, Loader } from 'lucide-react';
import jsPDF from 'jspdf';

// Import components individually if possible, use the index export as fallback
let InvoiceGenerator, PaymentTracking, PricingRules, FinancialReports;
try {
  const billing = require('@/components/admin/billing');
  InvoiceGenerator = billing.InvoiceGenerator;
  PaymentTracking = billing.PaymentTracking;
  PricingRules = billing.PricingRules;
  FinancialReports = billing.FinancialReports;
} catch (error) {
  console.error('Error importing billing components:', error);
  // If imports fail, we'll use our fallback implementations below
}

// Import AI pricing predictor component
import AIpricingPredictor from './billing/AIpricingPredictor';

interface BillingInvoicingTabProps {
  completedDeliveries: DeliveryRequest[];
  pendingDeliveries: DeliveryRequest[];
}

// Replace the existing createLogoDataUrl function
const createLogoDataUrl = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return null;
  
  // Fill background (transparent)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Create logo with gradient (matching the navbar style)
  const gradient = ctx.createLinearGradient(20, 20, 80, 80);
  gradient.addColorStop(0, '#0C4E9A'); // medical-blue
  gradient.addColorStop(1, '#1E9ABE'); // medical-teal
  
  // Draw logo box
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(20, 20, 60, 60, 8);
  ctx.fill();
  
  // Add CNL text to logo
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CNL', 50, 60);
  
  // Add company name text
  ctx.fillStyle = '#0C4E9A'; // medical-blue
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('Catalyst', 95, 50);
  
  ctx.fillStyle = '#1E9ABE'; // medical-teal
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Network', 200, 50);
  
  ctx.fillStyle = '#0C4E9A'; // medical-blue
  ctx.font = 'bold 28px Arial';
  ctx.fillText('Logistics', 140, 80);
  
  return canvas.toDataURL('image/png');
};

// Fallback Invoice component to ensure something renders
const FallbackInvoiceGenerator = ({ completedDeliveries }: { completedDeliveries: DeliveryRequest[] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [emailBeforePickup, setEmailBeforePickup] = useState(true);
  const [emailTemplateId, setEmailTemplateId] = useState('invoice-standard');
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  
  const generateInvoice = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success('Generated new invoice successfully');
      
      // Auto-send email if option is enabled
      if (emailBeforePickup) {
        sendInvoiceEmail('INV-2023-003', 'Baptist Health Research');
      }
    }, 1000);
  };
  
  const sendInvoiceEmail = (invoiceId: string, clientName: string) => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      toast.success(`Invoice ${invoiceId} emailed to ${clientName} successfully`);
    }, 1500);
  };

  const downloadInvoice = (invoiceId: string, clientName: string, amount: string = "$0.00", deliveryId?: string) => {
    setIsDownloading(true);
    
    // Find the associated delivery if deliveryId is provided
    const deliveryDetails = deliveryId && completedDeliveries ? 
      completedDeliveries.find(d => d.id === deliveryId) : null;
    
    // Create a PDF document
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Add logo
        const logoDataUrl = createLogoDataUrl();
        if (logoDataUrl) {
          doc.addImage(logoDataUrl, 'PNG', 10, 10, 180, 45);
        }
        
        // Add content to the PDF
        doc.setFontSize(18);
        doc.text("INVOICE", 105, 70, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Invoice Number: ${invoiceId}`, 20, 85);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 95);
        doc.text(`Client: ${clientName}`, 20, 105);
        
        // Adjust all Y positions by 5 more pixels to account for logo
        if (deliveryDetails) {
          doc.text(`Delivery ID: ${deliveryDetails.id || 'N/A'}`, 20, 115);
          const pickupDate = deliveryDetails.pickup_time ? 
            new Date(deliveryDetails.pickup_time).toLocaleDateString() : 'N/A';
          const deliveryDate = deliveryDetails.delivery_time ? 
            new Date(deliveryDetails.delivery_time).toLocaleDateString() : 'N/A';
          doc.text(`Pickup Date: ${pickupDate}`, 20, 125);
          doc.text(`Delivery Date: ${deliveryDate}`, 20, 135);
          doc.text(`Status: ${deliveryDetails.status || 'N/A'}`, 20, 145);
          
          doc.line(20, 155, 190, 155);
          
          doc.text("Description", 20, 165);
          doc.text("Amount", 160, 165);
          
          doc.text(`Medical Courier Services (${deliveryDetails.id})`, 20, 175);
          doc.text(amount, 160, 175);
          
          doc.line(20, 195, 190, 195);
          
          doc.text("Total Due:", 130, 205);
          doc.text(amount, 160, 205);
        } else {
          doc.line(20, 115, 190, 115);
          
          doc.text("Description", 20, 125);
          doc.text("Amount", 160, 125);
          
          doc.text("Medical Courier Services", 20, 135);
          doc.text(amount, 160, 135);
          
          doc.line(20, 155, 190, 155);
          
          doc.text("Total Due:", 130, 165);
          doc.text(amount, 160, 165);
        }
        
        doc.setFontSize(10);
        doc.text("Thank you for choosing Catalyst Network Logistics for your medical courier needs.", 105, 240, { align: 'center' });
        doc.text("Payment due within 30 days of invoice date.", 105, 250, { align: 'center' });
        
        // Save the PDF
        doc.save(`${invoiceId}_${clientName.replace(/\s+/g, '_')}.pdf`);
        
        toast.success(`Downloaded invoice ${invoiceId}`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF. Please try again.");
      }
      
      setIsDownloading(false);
    }, 1000);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Automated Invoice Generation</CardTitle>
              <CardDescription>Generate and manage invoices for completed deliveries</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-invoicing" 
                  checked={emailBeforePickup}
                  onCheckedChange={setEmailBeforePickup}
                />
                <Label htmlFor="auto-invoicing">Email Before Pickup</Label>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowEmailSettings(!showEmailSettings)}
              >
                Email Settings
              </Button>
              <Button onClick={generateInvoice} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showEmailSettings && (
          <CardContent className="border-t border-b py-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email-template">Email Template</Label>
                <Select 
                  value={emailTemplateId} 
                  onValueChange={setEmailTemplateId}
                >
                  <SelectTrigger id="email-template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="invoice-standard">Standard Invoice</SelectItem>
                    <SelectItem value="invoice-detailed">Detailed Invoice</SelectItem>
                    <SelectItem value="invoice-summary">Summary Only</SelectItem>
                    <SelectItem value="custom">Custom Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="email-timing">Send Email</Label>
                <Select defaultValue="before-pickup">
                  <SelectTrigger id="email-timing">
                    <SelectValue placeholder="When to send" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before-pickup">Before Pickup (1 hour)</SelectItem>
                    <SelectItem value="on-pickup">At Pickup Time</SelectItem>
                    <SelectItem value="after-delivery">After Delivery</SelectItem>
                    <SelectItem value="manually">Manually Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="cc-emails">CC Additional Emails</Label>
                <Input id="cc-emails" placeholder="finance@client.com, billing@client.com" />
              </div>
              
              <div className="md:col-span-2 flex justify-end">
                <Button variant="outline" className="mr-2" onClick={() => setShowEmailSettings(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  setShowEmailSettings(false);
                  toast.success('Email settings saved');
                }}>
                  Save Settings
                </Button>
              </div>
            </div>
          </CardContent>
        )}
        
        <CardContent>
          <p>You have {completedDeliveries?.length || 0} completed deliveries eligible for invoicing.</p>
          <div className="border rounded-md overflow-hidden mt-4">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Invoice ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      <span>INV-2023-001</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">San Antonio Medical Center</div>
                      <div className="text-xs text-gray-500">billing@samc.org</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">$1,250.50</td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      2023-07-15
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-green-100 text-green-800">Paid</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice('INV-2023-001', 'San Antonio Medical Center', '$1,250.50', completedDeliveries?.[0]?.id)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      <span>INV-2023-002</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">Methodist Hospital Labs</div>
                      <div className="text-xs text-gray-500">accounts@methodist.org</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">$875.25</td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      2023-07-20
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-blue-100 text-blue-800">Sent</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice('INV-2023-002', 'Methodist Hospital Labs', '$875.25', completedDeliveries?.[1]?.id)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendInvoiceEmail('INV-2023-002', 'Methodist Hospital Labs')}
                        disabled={isSendingEmail}
                      >
                        {isSendingEmail ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      <span>INV-2023-003</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">Baptist Health Research</div>
                      <div className="text-xs text-gray-500">finance@baptisthealth.org</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">$2,340.75</td>
                  <td className="px-4 py-3 text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Today
                    </div>
                    <div className="text-xs text-gray-500">
                      Pre-pickup invoice
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadInvoice('INV-2023-003', 'Baptist Health Research', '$2,340.75', completedDeliveries?.[2]?.id)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => sendInvoiceEmail('INV-2023-003', 'Baptist Health Research')}
                        disabled={isSendingEmail}
                      >
                        {isSendingEmail ? (
                          <RotateCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <ArrowRight className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Pickup Invoice Settings</CardTitle>
          <CardDescription>Configure automated invoice generation before pickup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-generation" defaultChecked />
                <Label htmlFor="auto-generation">Auto-generate invoices before pickup</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="email-invoices" defaultChecked />
                <Label htmlFor="email-invoices">Automatically email pre-pickup invoices</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="attach-pdf" defaultChecked />
                <Label htmlFor="attach-pdf">Attach PDF invoice to email</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pre-pickup-timing">Send Invoice Before Pickup</Label>
                <Select defaultValue="60">
                  <SelectTrigger id="pre-pickup-timing">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="120">2 hours before</SelectItem>
                    <SelectItem value="day">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="reminder-email">Send Payment Reminder</Label>
                <Select defaultValue="none">
                  <SelectTrigger id="reminder-email">
                    <SelectValue placeholder="Select reminder timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No reminders</SelectItem>
                    <SelectItem value="delivery">Upon delivery</SelectItem>
                    <SelectItem value="1day">1 day after delivery</SelectItem>
                    <SelectItem value="3days">3 days after delivery</SelectItem>
                    <SelectItem value="7days">7 days after delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fallback Payment tracking component
const FallbackPaymentTracking = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardDescription>Total Receivables</CardDescription>
          <CardTitle className="text-xl">$6,026.50</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-xs text-gray-500">
            From 4 invoices
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-4 pb-2">
          <CardDescription>Total Received</CardDescription>
          <CardTitle className="text-xl">$2,050.50</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center text-xs">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '34%' }}></div>
            </div>
            <div className="ml-2 text-gray-500">34%</div>
          </div>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Payment Tracking</CardTitle>
        <CardDescription>Track payments for all invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Payment tracking information will appear here.</p>
      </CardContent>
    </Card>
  </div>
);

// Fallback Pricing Rules component
const FallbackPricingRules = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Client Pricing Rules</CardTitle>
            <CardDescription>Manage custom pricing rules for clients</CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p>Pricing rules will appear here.</p>
      </CardContent>
    </Card>
  </div>
);

// Fallback Financial Reports component
const FallbackFinancialReports = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Revenue</CardDescription>
          <CardTitle className="text-xl">$152,250</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center text-xs">
            <Badge className="bg-green-100 text-green-800">
              <ArrowUp className="h-3 w-3 mr-1" />
              5.2% from last month
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
    <Card>
      <CardHeader>
        <CardTitle>Monthly Revenue</CardTitle>
        <CardDescription>Revenue trends over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Financial reports will appear here.</p>
      </CardContent>
    </Card>
  </div>
);

// Add PendingDeliveryInvoicing component
const PendingDeliveryInvoicing = ({ pendingDeliveries }: { pendingDeliveries: DeliveryRequest[] }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  const generatePreInvoices = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`Pre-generated invoices for ${selectedDeliveries.length} deliveries`);
      setSelectedDeliveries([]);
    }, 1500);
  };
  
  const toggleDeliverySelection = (id: string) => {
    setSelectedDeliveries(prev => 
      prev.includes(id) 
        ? prev.filter(delivId => delivId !== id) 
        : [...prev, id]
    );
  };
  
  const getClientName = (delivery: DeliveryRequest) => {
    if (delivery.clientName) return delivery.clientName;
    if (delivery.email) {
      const emailParts = delivery.email.split('@');
      return emailParts[0].replace(/[._-]/g, ' ');
    }
    return 'Medical Client';
  };
  
  const downloadInvoice = (invoiceId: string, clientName: string, amount: string = "$0.00", deliveryRequest?: DeliveryRequest) => {
    setIsDownloading(true);
    
    // Create a PDF document
    setTimeout(() => {
      try {
        const doc = new jsPDF();
        
        // Add logo
        const logoDataUrl = createLogoDataUrl();
        if (logoDataUrl) {
          doc.addImage(logoDataUrl, 'PNG', 10, 10, 180, 45);
        }
        
        // Add content to the PDF
        doc.setFontSize(18);
        doc.text("PRE-PICKUP INVOICE", 105, 70, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text(`Invoice Number: PRE-${invoiceId}`, 20, 85);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 95);
        doc.text(`Client: ${clientName}`, 20, 105);
        
        // Adjust all Y positions by 5 more pixels to account for logo
        if (deliveryRequest) {
          doc.text(`Delivery ID: ${deliveryRequest.id || 'N/A'}`, 20, 115);
          const pickupDate = deliveryRequest.pickup_time ? 
            new Date(deliveryRequest.pickup_time).toLocaleDateString() : 'Pending';
          doc.text(`Scheduled Pickup: ${pickupDate}`, 20, 125);
          doc.text(`Pickup Address: ${deliveryRequest.pickup_address || 'N/A'}`, 20, 135);
          doc.text(`Delivery Address: ${deliveryRequest.delivery_address || 'N/A'}`, 20, 145);
          
          doc.line(20, 155, 190, 155);
          
          doc.text("Description", 20, 165);
          doc.text("Amount", 160, 165);
          
          doc.text(`Pre-Pickup Medical Courier Services (${deliveryRequest.id})`, 20, 175);
          doc.text(amount, 160, 175);
          
          doc.line(20, 195, 190, 195);
          
          doc.text("Estimated Total:", 130, 205);
          doc.text(amount, 160, 205);
        } else {
          doc.line(20, 115, 190, 115);
          
          doc.text("Description", 20, 125);
          doc.text("Amount", 160, 125);
          
          doc.text("Medical Courier Services (Pre-Pickup)", 20, 135);
          doc.text(amount, 160, 135);
          
          doc.line(20, 155, 190, 155);
          
          doc.text("Estimated Total:", 130, 165);
          doc.text(amount, 160, 165);
        }
        
        doc.setFontSize(10);
        doc.text("This is a pre-pickup invoice. Final charges may vary based on actual delivery details.", 105, 230, { align: 'center' });
        doc.text("Thank you for choosing Catalyst Network Logistics for your medical courier needs.", 105, 240, { align: 'center' });
        doc.text("Payment due within 30 days of invoice date.", 105, 250, { align: 'center' });
        
        // Save the PDF
        doc.save(`Pre_Pickup_${invoiceId}_${clientName.replace(/\s+/g, '_')}.pdf`);
        
        toast.success(`Downloaded pre-pickup invoice for ${clientName}`);
      } catch (error) {
        console.error("Error generating PDF:", error);
        toast.error("Failed to generate PDF. Please try again.");
      }
      
      setIsDownloading(false);
    }, 1000);
  };
  
  const sendInvoiceEmail = (invoiceId: string, clientName: string) => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      toast.success(`Pre-pickup invoice for ${clientName} emailed successfully`);
    }, 1500);
  };
  
  // Add bulk invoice generation function
  const generateBulkInvoices = () => {
    if (selectedDeliveries.length === 0) {
      toast.error('Please select at least one delivery for invoice generation');
      return;
    }
    
    setIsGenerating(true);
    
    // Create a delay between each invoice to prevent browser hanging
    const generateWithDelay = async () => {
      for (let i = 0; i < selectedDeliveries.length; i++) {
        const id = selectedDeliveries[i];
        // Find delivery info
        const delivery = pendingDeliveries.find(d => d.id === id);
        if (delivery) {
          // Generate invoice
          await new Promise(resolve => {
            setTimeout(() => {
              downloadInvoice(id, getClientName(delivery), `$${delivery.estimatedCost?.toFixed(2) || '25.00'}`, delivery);
              resolve(null);
            }, 500); // 500ms delay between each invoice
          });
        }
      }
      
      // All done
      setIsGenerating(false);
      toast.success(`Generated ${selectedDeliveries.length} pre-pickup invoices`);
    };
    
    generateWithDelay();
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Pre-Pickup Invoicing</CardTitle>
              <CardDescription>Generate and email invoices before delivery pickup</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedDeliveries.length > 0 && (
                <Button 
                  variant="secondary"
                  onClick={generateBulkInvoices}
                  disabled={isGenerating || selectedDeliveries.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Download Invoices ({selectedDeliveries.length})
                    </>
                  )}
                </Button>
              )}
              <Button 
                onClick={generatePreInvoices} 
                disabled={isGenerating || selectedDeliveries.length === 0}
              >
                {isGenerating ? (
                  <>
                    <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Pre-Invoices ({selectedDeliveries.length})
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium w-8">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={pendingDeliveries.length > 0 && selectedDeliveries.length === pendingDeliveries.length}
                      onChange={() => {
                        if (selectedDeliveries.length === pendingDeliveries.length) {
                          setSelectedDeliveries([]);
                        } else {
                          setSelectedDeliveries(pendingDeliveries.map(d => d.id || '').filter(Boolean));
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Delivery ID</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Pickup Time</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Est. Cost</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No pending deliveries available for pre-invoicing
                    </td>
                  </tr>
                ) : (
                  pendingDeliveries.slice(0, 5).map((delivery, index) => {
                    // Generate some fake data for demonstration
                    const id = delivery.id || `DEL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    const clients = ['San Antonio Medical Center', 'Methodist Hospital Labs', 'Baptist Health Research', 'University Health System'];
                    const client = getClientName(delivery) || clients[index % clients.length];
                    const now = new Date();
                    // Pickup time in the next 1-4 hours
                    const pickupTime = new Date(now.getTime() + (1 + Math.floor(Math.random() * 3)) * 60 * 60 * 1000);
                    const cost = (50 + Math.random() * 150).toFixed(2);
                    
                    return (
                      <tr key={id} className="border-t">
                        <td className="px-4 py-3">
                          <input 
                            type="checkbox" 
                            className="rounded"
                            checked={selectedDeliveries.includes(id)}
                            onChange={() => toggleDeliverySelection(id)}
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{id}</td>
                        <td className="px-4 py-3">{client}</td>
                        <td className="px-4 py-3">
                          {pickupTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          <div className="text-xs text-gray-500">
                            {Math.floor((pickupTime.getTime() - now.getTime()) / (1000 * 60))} minutes from now
                          </div>
                        </td>
                        <td className="px-4 py-3">${cost}</td>
                        <td className="px-4 py-3">
                          <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadInvoice(id, client, `$${cost}`, delivery)}
                              disabled={isDownloading}
                            >
                              {isDownloading ? (
                                <RotateCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Download className="w-4 h-4" />
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => sendInvoiceEmail(id, client)}
                              disabled={isSendingEmail}
                            >
                              {isSendingEmail ? (
                                <RotateCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <ArrowRight className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Pre-Pickup Invoicing Benefits</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc pl-4">
              <li>Improve cash flow by invoicing before delivery occurs</li>
              <li>Reduce payment delays by setting clear expectations</li>
              <li>Streamline payment tracking for accounting departments</li>
              <li>Automatically notify clients of upcoming charges</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const BillingInvoicingTab = ({ completedDeliveries, pendingDeliveries }: BillingInvoicingTabProps) => {
  const [activeTab, setActiveTab] = useState('invoices');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    console.log('BillingInvoicingTab mounted with', completedDeliveries?.length || 0, 'completed and', pendingDeliveries?.length || 0, 'pending deliveries');
    
    // Attempt to load components
    try {
      // Set loaded after a small delay to ensure components are ready
      const timer = setTimeout(() => {
        setIsLoaded(true);
      }, 100);

      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Error in BillingInvoicingTab component:', error);
      setHasError(true);
      setIsLoaded(true); // Still mark as loaded to show fallback UI
    }
  }, [completedDeliveries, pendingDeliveries]);

  // For debugging - force the fallback implementation
  const useFallback = true; // Set to false if you want to try the imported components first

  // Render appropriate components based on whether imports succeeded
  const renderInvoiceGenerator = () => {
    if (useFallback || !InvoiceGenerator || hasError) {
      return <FallbackInvoiceGenerator completedDeliveries={completedDeliveries} />;
    }
    try {
      return <InvoiceGenerator completedDeliveries={completedDeliveries} />;
    } catch (error) {
      console.error('Error rendering InvoiceGenerator:', error);
      return <FallbackInvoiceGenerator completedDeliveries={completedDeliveries} />;
    }
  };

  const renderPaymentTracking = () => {
    if (useFallback || !PaymentTracking || hasError) {
      return <FallbackPaymentTracking />;
    }
    try {
      return <PaymentTracking completedDeliveries={completedDeliveries} />;
    } catch (error) {
      console.error('Error rendering PaymentTracking:', error);
      return <FallbackPaymentTracking />;
    }
  };

  const renderPricingRules = () => {
    if (useFallback || !PricingRules || hasError) {
      return <FallbackPricingRules />;
    }
    try {
      return <PricingRules />;
    } catch (error) {
      console.error('Error rendering PricingRules:', error);
      return <FallbackPricingRules />;
    }
  };

  const renderFinancialReports = () => {
    if (useFallback || !FinancialReports || hasError) {
      return <FallbackFinancialReports />;
    }
    try {
      return <FinancialReports completedDeliveries={completedDeliveries} />;
    } catch (error) {
      console.error('Error rendering FinancialReports:', error);
      return <FallbackFinancialReports />;
    }
  };

  // Display loading state while components initialize
  if (!isLoaded) {
    return <div className="p-4">Loading billing components...</div>;
  }

  return (
    <div className="space-y-6" id="billing-invoicing-content">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing & Invoicing</h2>
      </div>

      <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="invoices">Automated Invoices</TabsTrigger>
            <TabsTrigger value="pre-pickup">Pre-Pickup Invoicing</TabsTrigger>
            <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
            <TabsTrigger value="ai-pricing">AI Pricing</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="invoices">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader className="h-8 w-8 animate-spin" /></div>}>
            {renderInvoiceGenerator()}
          </Suspense>
        </TabsContent>
        
        <TabsContent value="pre-pickup">
          <PendingDeliveryInvoicing pendingDeliveries={pendingDeliveries} />
        </TabsContent>
        
        <TabsContent value="payments">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader className="h-8 w-8 animate-spin" /></div>}>
            {renderPaymentTracking()}
          </Suspense>
        </TabsContent>
        
        <TabsContent value="pricing">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader className="h-8 w-8 animate-spin" /></div>}>
            {renderPricingRules()}
          </Suspense>
        </TabsContent>
        
        <TabsContent value="ai-pricing">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader className="h-8 w-8 animate-spin" /></div>}>
            <AIpricingPredictor />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="reports">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader className="h-8 w-8 animate-spin" /></div>}>
            {renderFinancialReports()}
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingInvoicingTab; 