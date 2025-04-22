
import { Card, CardContent } from '@/components/ui/card';
import { BadgeCheck } from 'lucide-react';

interface CompletedCardProps {
  completedDeliveries: number;
}

const CompletedCard = ({ completedDeliveries }: CompletedCardProps) => {
  return (
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
  );
};

export default CompletedCard;
