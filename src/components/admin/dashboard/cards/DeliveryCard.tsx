
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface DeliveryCardProps {
  activeDeliveries: number;
}

const DeliveryCard = ({ activeDeliveries }: DeliveryCardProps) => {
  return (
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
  );
};

export default DeliveryCard;
