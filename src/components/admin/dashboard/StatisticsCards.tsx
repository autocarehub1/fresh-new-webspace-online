
import DeliveryCard from './cards/DeliveryCard';
import PendingCard from './cards/PendingCard';
import CompletedCard from './cards/CompletedCard';
import TotalCard from './cards/TotalCard';

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
      <DeliveryCard activeDeliveries={activeDeliveries} />
      <PendingCard pendingRequests={pendingRequests} />
      <CompletedCard completedDeliveries={completedDeliveries} />
      <TotalCard totalRequests={totalRequests} />
    </div>
  );
};

export default StatisticsCards;
