import { useState } from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CreditCard, Banknote, AlertCircle, CheckCircle2, Clock, SearchIcon, Filter, ArrowUpDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface PaymentTrackingProps {
  completedDeliveries: DeliveryRequest[];
}

interface Payment {
  id: string;
  invoiceId: string;
  clientName: string;
  amount: number;
  amountPaid: number;
  dueDate: string;
  paymentDate: string | null;
  method: 'credit_card' | 'bank_transfer' | 'check' | 'cash' | null;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
}

const demoPayments: Payment[] = [
  {
    id: 'PAY-001',
    invoiceId: 'INV-2023-001',
    clientName: 'San Antonio Medical Center',
    amount: 1250.50,
    amountPaid: 1250.50,
    dueDate: '2023-08-15',
    paymentDate: '2023-08-10',
    method: 'credit_card',
    status: 'paid'
  },
  {
    id: 'PAY-002',
    invoiceId: 'INV-2023-002',
    clientName: 'Methodist Hospital Labs',
    amount: 875.25,
    amountPaid: 0,
    dueDate: '2023-08-20',
    paymentDate: null,
    method: null,
    status: 'pending'
  },
  {
    id: 'PAY-003',
    invoiceId: 'INV-2023-003',
    clientName: 'Baptist Health Research',
    amount: 2340.75,
    amountPaid: 0,
    dueDate: '2023-07-28',
    paymentDate: null,
    method: null,
    status: 'overdue'
  },
  {
    id: 'PAY-004',
    invoiceId: 'INV-2023-004',
    clientName: 'University Health System',
    amount: 1560.00,
    amountPaid: 800.00,
    dueDate: '2023-09-05',
    paymentDate: '2023-08-20',
    method: 'bank_transfer',
    status: 'partial'
  }
];

const PaymentTracking = ({ completedDeliveries }: PaymentTrackingProps) => {
  const [payments, setPayments] = useState<Payment[]>(demoPayments);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');
  
  // Calculate payment statistics
  const totalReceivables = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalReceived = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const overdue = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + (p.amount - p.amountPaid), 0);
  const collectionRate = totalReceivables > 0 ? (totalReceived / totalReceivables) * 100 : 0;
  
  const recordPayment = (paymentId: string, method: 'credit_card' | 'bank_transfer' | 'check' | 'cash', amount: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) return;
    
    const newAmountPaid = payment.amountPaid + amount;
    const newStatus = newAmountPaid >= payment.amount 
      ? 'paid' 
      : newAmountPaid > 0 
        ? 'partial' 
        : payment.status;
    
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { 
            ...p, 
            amountPaid: newAmountPaid, 
            status: newStatus, 
            method, 
            paymentDate: new Date().toISOString().split('T')[0] 
          } 
        : p
    ));
    
    toast.success(`Recorded ${amount.toFixed(2)} payment for ${paymentId}`);
  };
  
  const sendReminder = (paymentId: string) => {
    toast.success(`Payment reminder sent for ${paymentId}`);
  };
  
  const markAsOverdue = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId ? { ...p, status: 'overdue' } : p
    ));
    
    toast.info(`Marked payment ${paymentId} as overdue`);
  };
  
  // Filter and sort payments
  const filteredPayments = payments
    .filter(payment => 
      payment.clientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.invoiceId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(payment => statusFilter ? payment.status === statusFilter : true)
    .sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'amount') {
        return b.amount - a.amount;
      } else if (sortBy === 'clientName') {
        return a.clientName.localeCompare(b.clientName);
      } else {
        return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription>Total Receivables</CardDescription>
            <CardTitle className="text-xl">${totalReceivables.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xs text-gray-500">
              From {payments.length} invoices
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription>Total Received</CardDescription>
            <CardTitle className="text-xl">${totalReceived.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex items-center text-xs">
              <div className="flex-1">
                <Progress value={collectionRate} className="h-2" />
              </div>
              <div className="ml-2 text-gray-500">{collectionRate.toFixed(0)}%</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription>Overdue Amount</CardDescription>
            <CardTitle className="text-xl text-red-600">${overdue.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xs text-gray-500">
              From {payments.filter(p => p.status === 'overdue').length} overdue invoices
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardDescription>Payment Status</CardDescription>
            <CardTitle className="text-xl">
              {payments.filter(p => p.status === 'paid').length} / {payments.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xs text-gray-500">
              Fully paid invoices
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
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Search by client or invoice ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All statuses" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <div className="flex items-center">
                  <ArrowUpDown className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dueDate">Due date</SelectItem>
                <SelectItem value="amount">Amount</SelectItem>
                <SelectItem value="clientName">Client name</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Invoice</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Due Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-500">
                      No payments found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="font-medium">{payment.invoiceId}</div>
                        <div className="text-xs text-gray-500">{payment.id}</div>
                      </td>
                      <td className="px-4 py-3">
                        {payment.clientName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">${payment.amount.toFixed(2)}</div>
                        {payment.status === 'partial' && (
                          <div className="text-xs text-gray-500">
                            Paid: ${payment.amountPaid.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-500" />
                          {payment.dueDate}
                        </div>
                        {payment.paymentDate && (
                          <div className="text-xs text-gray-500">
                            Paid: {payment.paymentDate}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`
                          ${payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          ${payment.status === 'partial' ? 'bg-blue-100 text-blue-800' : ''}
                          ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                          ${payment.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                        `}>
                          {payment.status === 'pending' && 'Pending'}
                          {payment.status === 'partial' && 'Partially Paid'}
                          {payment.status === 'paid' && 'Paid'}
                          {payment.status === 'overdue' && 'Overdue'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {(payment.status === 'pending' || payment.status === 'partial' || payment.status === 'overdue') && (
                            <Select 
                              onValueChange={(value) => {
                                const remainingAmount = payment.amount - payment.amountPaid;
                                recordPayment(
                                  payment.id, 
                                  value as 'credit_card' | 'bank_transfer' | 'check' | 'cash',
                                  remainingAmount
                                );
                              }}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue placeholder="Record Payment" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="credit_card">Credit Card</SelectItem>
                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                <SelectItem value="check">Check</SelectItem>
                                <SelectItem value="cash">Cash</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                          
                          {(payment.status === 'pending' || payment.status === 'partial') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => sendReminder(payment.id)}
                            >
                              <AlertCircle className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {payment.status === 'pending' && 
                           new Date(payment.dueDate) < new Date() && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => markAsOverdue(payment.id)}
                            >
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
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
    </div>
  );
};

export default PaymentTracking; 