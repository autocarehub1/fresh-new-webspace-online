import { useState } from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, Download, Calendar, ArrowRight, Plus, RotateCw } from 'lucide-react';

export interface InvoiceGeneratorProps {
  completedDeliveries: DeliveryRequest[];
}

interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  deliveries: string[];
}

const demoInvoices: Invoice[] = [
  {
    id: 'INV-2023-001',
    clientName: 'San Antonio Medical Center',
    clientEmail: 'billing@samc.org',
    amount: 1250.50,
    date: '2023-07-15',
    status: 'paid',
    deliveries: ['MED-A1B2C3', 'MED-D4E5F6']
  },
  {
    id: 'INV-2023-002',
    clientName: 'Methodist Hospital Labs',
    clientEmail: 'accounts@methodist.org',
    amount: 875.25,
    date: '2023-07-20',
    status: 'sent',
    deliveries: ['MED-G7H8I9']
  },
  {
    id: 'INV-2023-003',
    clientName: 'Baptist Health Research',
    clientEmail: 'finance@baptisthealth.org',
    amount: 2340.75,
    date: '2023-07-28',
    status: 'overdue',
    deliveries: ['MED-J1K2L3', 'MED-M4N5O6', 'MED-P7Q8R9']
  },
  {
    id: 'INV-2023-004',
    clientName: 'University Health System',
    clientEmail: 'ap@universityheath.org',
    amount: 1560.00,
    date: '2023-08-05',
    status: 'draft',
    deliveries: ['MED-S1T2U3', 'MED-V4W5X6']
  }
];

const InvoiceGenerator = ({ completedDeliveries }: InvoiceGeneratorProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>(demoInvoices);
  const [clientFilter, setClientFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAutoInvoicing, setIsAutoInvoicing] = useState(true);

  const generateNewInvoice = () => {
    setIsGenerating(true);
    
    // Simulate invoice generation
    setTimeout(() => {
      const newInvoiceId = `INV-2023-00${invoices.length + 1}`;
      const clients = ['San Antonio Medical Center', 'Methodist Hospital Labs', 'Baptist Health Research', 'University Health System', 'Christus Santa Rosa Hospital'];
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const clientEmailMap: Record<string, string> = {
        'San Antonio Medical Center': 'billing@samc.org',
        'Methodist Hospital Labs': 'accounts@methodist.org',
        'Baptist Health Research': 'finance@baptisthealth.org',
        'University Health System': 'ap@universityheath.org',
        'Christus Santa Rosa Hospital': 'billing@christussantarosa.org'
      };
      
      const amount = Math.floor(Math.random() * 2000) + 500 + Math.random();
      
      const newInvoice: Invoice = {
        id: newInvoiceId,
        clientName: randomClient,
        clientEmail: clientEmailMap[randomClient] || 'billing@hospital.org',
        amount: parseFloat(amount.toFixed(2)),
        date: new Date().toISOString().split('T')[0],
        status: 'draft',
        deliveries: completedDeliveries
          .slice(0, Math.floor(Math.random() * 3) + 1)
          .map(d => d.id || `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)
      };
      
      setInvoices([newInvoice, ...invoices]);
      setIsGenerating(false);
      toast.success(`Generated invoice ${newInvoiceId}`);
    }, 1500);
  };

  const handleStatusChange = (invoiceId: string, newStatus: 'draft' | 'sent' | 'paid' | 'overdue') => {
    setInvoices(invoices.map(invoice => 
      invoice.id === invoiceId 
        ? { ...invoice, status: newStatus } 
        : invoice
    ));
    
    toast.success(`Updated invoice ${invoiceId} status to ${newStatus}`);
  };
  
  const downloadInvoice = (invoiceId: string) => {
    toast.success(`Downloaded invoice ${invoiceId} as PDF`);
  };
  
  const filteredInvoices = invoices
    .filter(invoice => clientFilter ? invoice.clientName.toLowerCase().includes(clientFilter.toLowerCase()) : true)
    .filter(invoice => statusFilter ? invoice.status === statusFilter : true);

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
                  checked={isAutoInvoicing}
                  onCheckedChange={setIsAutoInvoicing}
                />
                <Label htmlFor="auto-invoicing">Auto Invoicing</Label>
              </div>
              <Button onClick={generateNewInvoice} disabled={isGenerating}>
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
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input 
                placeholder="Filter by client name..." 
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md overflow-hidden">
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
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No invoices found. Generate a new invoice to get started.</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-gray-500" />
                          <span>{invoice.id}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{invoice.clientName}</div>
                          <div className="text-xs text-gray-500">{invoice.clientEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">${invoice.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {invoice.date}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Select 
                          value={invoice.status} 
                          onValueChange={(value) => handleStatusChange(
                            invoice.id, 
                            value as 'draft' | 'sent' | 'paid' | 'overdue'
                          )}
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue>
                              <div className="flex items-center">
                                <Badge className={`
                                  ${invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' : ''}
                                  ${invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : ''}
                                  ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                                  ${invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                                `}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </Badge>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="overdue">Overdue</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => downloadInvoice(invoice.id)}>
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Settings</CardTitle>
          <CardDescription>Configure automated invoice generation settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="auto-generation" defaultChecked />
                <Label htmlFor="auto-generation">Auto-generate invoices for completed deliveries</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="bundled-invoices" defaultChecked />
                <Label htmlFor="bundled-invoices">Bundle multiple deliveries in a single invoice</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="email-invoices" defaultChecked />
                <Label htmlFor="email-invoices">Automatically email invoices when generated</Label>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="invoice-schedule">Invoice Generation Schedule</Label>
                <Select defaultValue="weekly">
                  <SelectTrigger id="invoice-schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="invoice-template">Invoice Template</Label>
                <Select defaultValue="standard">
                  <SelectTrigger id="invoice-template">
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Template</SelectItem>
                    <SelectItem value="detailed">Detailed Template</SelectItem>
                    <SelectItem value="summary">Summary Template</SelectItem>
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

export default InvoiceGenerator; 