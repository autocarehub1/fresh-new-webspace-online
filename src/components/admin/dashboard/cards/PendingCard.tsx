
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface PendingCardProps {
  pendingRequests: number;
}

const PendingCard = ({ pendingRequests }: PendingCardProps) => {
  return (
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
  );
};

export default PendingCard;
