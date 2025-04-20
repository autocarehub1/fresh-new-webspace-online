
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Driver } from '@/types/delivery';

interface DriversOverviewProps {
  activeDrivers: Driver[];
  totalDrivers: Driver[];
}

const DriversOverview = ({ activeDrivers, totalDrivers }: DriversOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Active Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeDrivers.length}</div>
          <p className="text-sm text-gray-500">of {totalDrivers.length} total drivers</p>
          <Progress className="mt-2" value={(activeDrivers.length / totalDrivers.length) * 100} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DriversOverview;
