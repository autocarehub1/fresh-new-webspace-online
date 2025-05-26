import { useState, useEffect } from 'react';
import { DeliveryRequest } from '@/types/delivery';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { BarChart3, PieChart, Download, TrendingUp, ArrowDown, ArrowUp, DollarSign, Calendar, DownloadCloud } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface FinancialReportsProps {
  completedDeliveries: DeliveryRequest[];
}

interface RevenueData {
  period: string;
  amount: number;
  count: number;
  change: number;
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Function to generate demo financial data
const generateFinancialData = (): RevenueData[] => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const data: RevenueData[] = [];
  
  // Generate data for the last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = (currentMonth - i + 12) % 12;
    const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    
    // Base amount with some random variation
    const baseAmount = 15000 + Math.random() * 5000;
    // Gradually increasing trend with random noise
    const trendFactor = 1 + (5 - i) * 0.05;
    const randomFactor = 0.8 + Math.random() * 0.4;
    const amount = baseAmount * trendFactor * randomFactor;
    
    // Count of deliveries
    const count = Math.floor(80 + Math.random() * 40);
    
    // Calculate change from previous month
    const change = i === 5 ? 0 : ((amount - data[data.length - 1].amount) / data[data.length - 1].amount) * 100;
    
    data.push({
      period: `${monthNames[month]} ${year}`,
      amount: parseFloat(amount.toFixed(2)),
      count,
      change: parseFloat(change.toFixed(1))
    });
  }
  
  return data;
};

// Client revenue distribution data
const clientRevenueData = [
  { client: 'San Antonio Medical Center', revenue: 42500, percentage: 28 },
  { client: 'Methodist Hospital Labs', revenue: 36750, percentage: 24 },
  { client: 'Baptist Health Research', revenue: 27500, percentage: 18 },
  { client: 'University Health System', revenue: 22500, percentage: 15 },
  { client: 'Christus Santa Rosa Hospital', revenue: 15500, percentage: 10 },
  { client: 'Other Clients', revenue: 7500, percentage: 5 }
];

// Service type revenue distribution
const serviceTypeData = [
  { service: 'Standard Delivery', revenue: 45000, percentage: 30 },
  { service: 'Temperature-Controlled', revenue: 60000, percentage: 40 },
  { service: 'Urgent Delivery', revenue: 37500, percentage: 25 },
  { service: 'Specialized Transport', revenue: 7500, percentage: 5 }
];

const FinancialReports = ({ completedDeliveries }: FinancialReportsProps) => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [timeframe, setTimeframe] = useState('6months');
  const [reportType, setReportType] = useState('revenue');
  const [exportLoading, setExportLoading] = useState(false);
  
  useEffect(() => {
    // Generate demo data
    setRevenueData(generateFinancialData());
  }, []);
  
  const totalRevenue = revenueData.reduce((sum, data) => sum + data.amount, 0);
  const totalDeliveries = revenueData.reduce((sum, data) => sum + data.count, 0);
  const averageRevenuePerDelivery = totalDeliveries > 0 ? totalRevenue / totalDeliveries : 0;
  
  // Calculate growth
  const latestMonth = revenueData[revenueData.length - 1];
  const previousMonth = revenueData[revenueData.length - 2];
  const monthlyGrowth = previousMonth ? (latestMonth.amount - previousMonth.amount) / previousMonth.amount * 100 : 0;
  
  const handleExportReport = () => {
    setExportLoading(true);
    
    // Simulate export process
    setTimeout(() => {
      setExportLoading(false);
      toast.success(`Exported ${reportType} report for the last ${timeframe === '6months' ? '6 months' : '12 months'}`);
    }, 1500);
  };
  
  const handlePrintReport = () => {
    toast.success('Preparing report for printing...');
    // In a real app, this would trigger the browser print dialog
  };

  const changeTimeframe = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    // In a real app, this would fetch new data for the selected timeframe
    toast.success(`Updated report to show data for the last ${newTimeframe === '6months' ? '6 months' : '12 months'}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-xl">${totalRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center text-xs">
              <Badge className={monthlyGrowth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {monthlyGrowth >= 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                {Math.abs(monthlyGrowth).toFixed(1)}% from last month
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Deliveries</CardDescription>
            <CardTitle className="text-xl">{totalDeliveries}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-gray-500">
              For the last {timeframe === '6months' ? '6 months' : '12 months'}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Revenue</CardDescription>
            <CardTitle className="text-xl">${averageRevenuePerDelivery.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-gray-500">
              Per delivery
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Top Client</CardDescription>
            <CardTitle className="text-xl">SAMC</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs text-gray-500">
              28% of total revenue
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Select value={timeframe} onValueChange={changeTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Report Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="revenue">Revenue Report</SelectItem>
              <SelectItem value="client">Client Analysis</SelectItem>
              <SelectItem value="service">Service Type Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrintReport}>
            <Download className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button onClick={handleExportReport} disabled={exportLoading}>
            {exportLoading ? (
              <>
                <DownloadCloud className="h-4 w-4 mr-2 animate-bounce" />
                Exporting...
              </>
            ) : (
              <>
                <DownloadCloud className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="revenue" value={reportType} onValueChange={setReportType}>
        <TabsList className="mb-4">
          <TabsTrigger value="revenue">
            <BarChart3 className="h-4 w-4 mr-2" />
            Revenue Trends
          </TabsTrigger>
          <TabsTrigger value="client">
            <PieChart className="h-4 w-4 mr-2" />
            Client Analysis
          </TabsTrigger>
          <TabsTrigger value="service">
            <TrendingUp className="h-4 w-4 mr-2" />
            Service Type Analysis
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
              <CardDescription>
                Revenue trends over the {timeframe === '6months' ? 'last 6 months' : 'last 12 months'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Bar chart visualization */}
              <div className="h-80 w-full">
                <div className="flex h-full">
                  <div className="flex flex-col justify-between py-2 pr-2 text-xs text-gray-500">
                    <div>$20k</div>
                    <div>$15k</div>
                    <div>$10k</div>
                    <div>$5k</div>
                    <div>$0</div>
                  </div>
                  <div className="flex-1 flex items-end justify-between gap-2">
                    {revenueData.map((data, index) => {
                      // Calculate height based on revenue amount (max 20k)
                      const height = (data.amount / 20000) * 100;
                      return (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="w-16 bg-blue-500 rounded-t-md relative group"
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              ${data.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                              <div className="text-[10px]">{data.count} deliveries</div>
                            </div>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">{data.period}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Period</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Deliveries</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Avg. Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((data, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            {data.period}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${data.amount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {data.count}
                        </td>
                        <td className="px-4 py-3 text-right">
                          ${(data.amount / data.count).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {index > 0 && (
                            <Badge className={data.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {data.change >= 0 ? '+' : ''}{data.change}%
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="client">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Client</CardTitle>
              <CardDescription>
                Distribution of revenue across different clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-8">
                <div className="flex-1 flex justify-center">
                  {/* Pie chart visualization */}
                  <div className="relative w-64 h-64">
                    <svg width="100%" height="100%" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="#d1d5db" strokeWidth="20" />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#3b82f6" 
                        strokeWidth="20" 
                        strokeDasharray={`${28 * 2.51} ${(100 - 28) * 2.51}`}
                        strokeDashoffset="0" 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#60a5fa" 
                        strokeWidth="20" 
                        strokeDasharray={`${24 * 2.51} ${(100 - 24) * 2.51}`}
                        strokeDashoffset={`${(100 - 28) * 2.51}`} 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#93c5fd" 
                        strokeWidth="20" 
                        strokeDasharray={`${18 * 2.51} ${(100 - 18) * 2.51}`}
                        strokeDashoffset={`${(100 - 28 - 24) * 2.51}`} 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#bfdbfe" 
                        strokeWidth="20" 
                        strokeDasharray={`${15 * 2.51} ${(100 - 15) * 2.51}`}
                        strokeDashoffset={`${(100 - 28 - 24 - 18) * 2.51}`} 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#dbeafe" 
                        strokeWidth="20" 
                        strokeDasharray={`${10 * 2.51} ${(100 - 10) * 2.51}`}
                        strokeDashoffset={`${(100 - 28 - 24 - 18 - 15) * 2.51}`} 
                      />
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="40" 
                        fill="transparent" 
                        stroke="#eff6ff" 
                        strokeWidth="20" 
                        strokeDasharray={`${5 * 2.51} ${(100 - 5) * 2.51}`}
                        strokeDashoffset={`${(100 - 28 - 24 - 18 - 15 - 10) * 2.51}`} 
                      />
                      <text x="50" y="50" textAnchor="middle" dy=".3em" className="text-xl font-bold">$152K</text>
                    </svg>
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="space-y-2">
                    {clientRevenueData.map((client, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 bg-blue-${600 - index * 100}`} />
                        <div className="flex-1">{client.client}</div>
                        <div className="text-right text-sm font-medium">${client.revenue.toLocaleString()}</div>
                        <div className="w-8 text-right text-sm text-gray-500">{client.percentage}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Client</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Deliveries</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Avg. Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientRevenueData.map((client, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-3 font-medium">{client.client}</td>
                        <td className="px-4 py-3 text-right">${client.revenue.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right">{Math.floor(client.revenue / 183)}</td>
                        <td className="px-4 py-3 text-right">${(183).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge className="bg-blue-100 text-blue-800">
                            {client.percentage}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50 border-t">
                      <td className="px-4 py-3 font-bold">Total</td>
                      <td className="px-4 py-3 text-right font-bold">$152,250</td>
                      <td className="px-4 py-3 text-right font-bold">832</td>
                      <td className="px-4 py-3 text-right font-bold">$183.00</td>
                      <td className="px-4 py-3 text-right font-bold">100%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="service">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Service Type</CardTitle>
              <CardDescription>
                Revenue distribution across different service types
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Horizontal bar chart */}
              <div className="mb-8">
                {serviceTypeData.map((service, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{service.service}</span>
                      <span className="text-sm text-gray-500">${service.revenue.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`bg-blue-${index === 0 ? '500' : index === 1 ? '600' : index === 2 ? '700' : '800'} h-3 rounded-full`}
                        style={{ width: `${service.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-500">{service.percentage}%</span>
                      <span className="text-xs text-gray-500">{Math.floor(service.revenue / 183)} deliveries</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Service Type</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Avg. Revenue</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Deliveries</th>
                      <th className="px-4 py-3 text-right text-sm font-medium">Avg. Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {serviceTypeData.map((service, index) => {
                      const deliveries = Math.floor(service.revenue / 183);
                      const basePrice = index === 0 ? 15 : index === 1 ? 20 : index === 2 ? 25 : 30;
                      const avgDistance = (service.revenue / deliveries / basePrice).toFixed(1);
                      
                      return (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-3 font-medium">{service.service}</td>
                          <td className="px-4 py-3 text-right">${service.revenue.toLocaleString()}</td>
                          <td className="px-4 py-3 text-right">${(service.revenue / deliveries).toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">{deliveries}</td>
                          <td className="px-4 py-3 text-right">{avgDistance} miles</td>
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-50 border-t">
                      <td className="px-4 py-3 font-bold">Total</td>
                      <td className="px-4 py-3 text-right font-bold">$150,000</td>
                      <td className="px-4 py-3 text-right font-bold">$183.00</td>
                      <td className="px-4 py-3 text-right font-bold">820</td>
                      <td className="px-4 py-3 text-right font-bold">8.3 miles</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialReports; 