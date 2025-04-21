
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Truck, Check } from 'lucide-react';

interface RequestsStatsProps {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}

const RequestsStats = ({ total, pending, inProgress, completed }: RequestsStatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Total Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{total}</div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Pending</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="text-3xl font-bold">{pending}</div>
        <Clock className="h-8 w-8 text-yellow-500" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">In Progress</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="text-3xl font-bold">{inProgress}</div>
        <Truck className="h-8 w-8 text-blue-500" />
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Completed</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div className="text-3xl font-bold">{completed}</div>
        <Check className="h-8 w-8 text-green-500" />
      </CardContent>
    </Card>
  </div>
);

export default RequestsStats;
