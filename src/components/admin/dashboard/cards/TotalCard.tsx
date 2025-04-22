
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface TotalCardProps {
  totalRequests: number;
}

const TotalCard = ({ totalRequests }: TotalCardProps) => {
  return (
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
  );
};

export default TotalCard;
