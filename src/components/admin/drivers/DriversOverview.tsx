import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Clock, MapPin, Users } from 'lucide-react';
import type { Driver } from '@/types/delivery';

interface DriversOverviewProps {
  activeDrivers: Driver[];
  totalDrivers: Driver[];
}

const DriversOverview = ({ activeDrivers, totalDrivers }: DriversOverviewProps) => {
  const totalActive = activeDrivers.length;
  const totalInactive = totalDrivers.length - totalActive;
  const averageResponseTime = activeDrivers.reduce((acc, driver) => {
    return acc + (driver.average_response_time || 0);
  }, 0) / (totalActive || 1);

  const metrics = [
    {
      title: "Total Drivers",
      value: totalDrivers.length,
      icon: Users,
      description: "All registered drivers"
    },
    {
      title: "Active Drivers",
      value: totalActive,
      icon: Activity,
      description: "Currently on duty"
    },
    {
      title: "Average Response",
      value: `${averageResponseTime.toFixed(1)} min`,
      icon: Clock,
      description: "Time to accept delivery"
    },
    {
      title: "Coverage Area",
      value: "100%",
      icon: MapPin,
      description: "Service coverage"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {metric.title}
            </CardTitle>
            <metric.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DriversOverview;

