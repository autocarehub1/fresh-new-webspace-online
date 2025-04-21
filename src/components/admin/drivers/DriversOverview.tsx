
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Driver } from '@/types/delivery';

interface DriversOverviewProps {
  activeDrivers: Driver[];
  totalDrivers: Driver[];
}

const DriversOverview = ({ activeDrivers, totalDrivers }: DriversOverviewProps) => {
  const inactiveDrivers = totalDrivers.filter(d => d.status === 'inactive');
  const percentActive = totalDrivers.length > 0 ? (activeDrivers.length / totalDrivers.length) * 100 : 0;
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-[#6E59A5]">Active Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-[#6E59A5]">{activeDrivers.length}</div>
            <span className="ml-2 text-gray-500">/ {totalDrivers.length} total</span>
          </div>
          <Progress className="mt-2" value={percentActive} />
          <div className="text-xs text-gray-500 mt-2">
            {inactiveDrivers.length > 0 ? (
              <span>
                <span className="font-semibold">{inactiveDrivers.length}</span> inactive
              </span>
            ) : (
              <span>All drivers are active</span>
            )}
          </div>
        </CardContent>
      </Card>
      {/* Suggestion: Add more cards if needed (e.g., "On Delivery" drivers) */}
    </div>
  );
};

export default DriversOverview;

