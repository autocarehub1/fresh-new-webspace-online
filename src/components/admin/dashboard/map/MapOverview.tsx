
interface MapOverviewProps {
  activeDeliveries: number;
  pendingRequests: number;
}

const MapOverview = ({ activeDeliveries, pendingRequests }: MapOverviewProps) => {
  return (
    <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Live Overview</h3>
      <p className="text-sm mb-1">Active Deliveries: <span className="font-bold text-blue-600">{activeDeliveries}</span></p>
      <p className="text-sm">Pending Requests: <span className="font-bold text-yellow-600">{pendingRequests}</span></p>
    </div>
  );
};

export default MapOverview;
