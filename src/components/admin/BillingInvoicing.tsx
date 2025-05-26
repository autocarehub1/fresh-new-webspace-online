import { useState } from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Import all billing components from the index file
import { 
  InvoiceGenerator, 
  PaymentTracking, 
  PricingRules, 
  FinancialReports 
} from '@/components/admin/billing';

interface BillingInvoicingProps {
  completedDeliveries: DeliveryRequest[];
}

const BillingInvoicing = ({ completedDeliveries }: BillingInvoicingProps) => {
  const [activeTab, setActiveTab] = useState('invoices');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Billing & Invoicing</h2>
      </div>

      <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="invoices">Automated Invoices</TabsTrigger>
            <TabsTrigger value="payments">Payment Tracking</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Rules</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="invoices">
          <InvoiceGenerator completedDeliveries={completedDeliveries} />
        </TabsContent>
        
        <TabsContent value="payments">
          <PaymentTracking completedDeliveries={completedDeliveries} />
        </TabsContent>
        
        <TabsContent value="pricing">
          <PricingRules />
        </TabsContent>
        
        <TabsContent value="reports">
          <FinancialReports completedDeliveries={completedDeliveries} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingInvoicing; 