
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Clock, BadgeCheck, Package } from 'lucide-react';

interface StatisticsCardsProps {
  activeDeliveries: number;
  pendingRequests: number;
  completedDeliveries: number;
  totalRequests: number;
}

const StatisticsCards = ({
  activeDeliveries,
  pendingRequests,
  completedDeliveries,
  totalRequests
}: StatisticsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Deliveries</p>
            <h3 className="text-2xl font-bold text-blue-600">{activeDeliveries}</h3>
          </div>
          <div className="p-2 bg-blue-100 rounded-full">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
            <h3 className="text-2xl font-bold text-yellow-600">{pendingRequests}</h3>
          </div>
          <div className="p-2 bg-yellow-100 rounded-full">
            <Clock className="h-6 w-6 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Completed Deliveries</p>
            <h3 className="text-2xl font-bold text-green-600">{completedDeliveries}</h3>
          </div>
          <div className="p-2 bg-green-100 rounded-full">
            <BadgeCheck className="h-6 w-6 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="flex flex-row items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
            <h3 className="text-2xl font-bold text-indigo-600">{totalRequests}</h3>
          </div>
          <div className="p-2 bg-indigo-100 rounded-full">
            <Package className="h-6 w-6 text-indigo-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatisticsCards;
