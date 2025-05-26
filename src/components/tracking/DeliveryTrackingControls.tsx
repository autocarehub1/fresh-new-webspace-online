
import React from 'react';
import { Button } from '@/components/ui/button';

interface DeliveryTrackingControlsProps {
  isLiveTracking: boolean;
  simulationSpeed: 'slow' | 'normal' | 'fast';
  delivery: any;
  onStart: (speed: 'slow' | 'normal' | 'fast') => void;
  onStop: () => void;
  onReset: () => void;
  onSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
}

const DeliveryTrackingControls: React.FC<DeliveryTrackingControlsProps> = ({
  isLiveTracking,
  simulationSpeed,
  delivery,
  onStart,
  onStop,
  onReset,
  onSpeedChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-2">
        {!isLiveTracking ? (
          <Button 
            size="sm" 
            variant="default" 
            className="px-3"
            onClick={() => onStart(simulationSpeed)}
            disabled={!delivery || delivery.status === 'completed'}
          >
            Start Tracking
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="outline" 
            className="px-3"
            onClick={onStop}
          >
            Pause
          </Button>
        )}
        <Button 
          size="sm" 
          variant="outline" 
          className="px-3"
          onClick={onReset}
          disabled={!delivery || (delivery.status !== 'in_progress' && delivery.status !== 'completed')}
        >
          Reset
        </Button>
      </div>
      
      <div className="flex items-center gap-2 text-sm mt-2 md:mt-0">
        <span className="text-gray-600">Simulation Speed:</span>
        <div className="flex border rounded-md overflow-hidden">
          <button 
            className={`px-2 py-0.5 text-xs ${simulationSpeed === 'slow' ? 'bg-gray-200 font-medium' : 'bg-white'}`}
            onClick={() => onSpeedChange('slow')}
          >
            Slow
          </button>
          <button 
            className={`px-2 py-0.5 text-xs ${simulationSpeed === 'normal' ? 'bg-gray-200 font-medium' : 'bg-white'}`}
            onClick={() => onSpeedChange('normal')}
          >
            Normal
          </button>
          <button 
            className={`px-2 py-0.5 text-xs ${simulationSpeed === 'fast' ? 'bg-gray-200 font-medium' : 'bg-white'}`}
            onClick={() => onSpeedChange('fast')}
          >
            Fast
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTrackingControls;
