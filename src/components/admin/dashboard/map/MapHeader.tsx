
import { CardHeader, CardTitle } from '@/components/ui/card';

interface MapHeaderProps {
  isSimulating: boolean;
  onToggleSimulation: () => void;
}

const MapHeader = ({ isSimulating, onToggleSimulation }: MapHeaderProps) => {
  return (
    <CardHeader className="pb-2">
      <CardTitle className="text-lg flex justify-between items-center">
        <span>Live Delivery Map</span>
        <button 
          onClick={onToggleSimulation}
          className={`text-sm px-3 py-1 rounded ${isSimulating ? 
            'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}
        >
          {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
        </button>
      </CardTitle>
    </CardHeader>
  );
};

export default MapHeader;
