
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Clock, Truck, Info } from 'lucide-react';

interface DeliveryTrackingETAProps {
  delivery: any;
  eta: { distance: string; eta: number } | null;
  trafficCondition: 'good' | 'moderate' | 'heavy';
  detailedStatus: string;
  etaProgress: number;
  etaCountdown: number | null;
}

const DeliveryTrackingETA: React.FC<DeliveryTrackingETAProps> = ({
  delivery,
  eta,
  trafficCondition,
  detailedStatus,
  etaProgress,
  etaCountdown
}) => {
  if (delivery?.status !== 'in_progress') {
    return null;
  }

  return (
    <div className="mb-4">
      {/* Status Display */}
      <div className="flex items-center gap-1 text-sm mb-4">
        <span className="text-gray-600">Status:</span>
        <span className="text-green-600 flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          En Route
        </span>
      </div>
      
      {/* ETA and Traffic Information */}
      {eta && (
        <div className="bg-gray-50 rounded-md p-3 mb-4 flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-medical-blue" />
            <span>
              <strong>ETA:</strong> {eta.eta} minutes
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-medical-blue" />
            <span>
              <strong>Distance:</strong> {eta.distance} km
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {trafficCondition === 'good' ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Traffic: Good</span>
              </div>
            ) : trafficCondition === 'moderate' ? (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Traffic: Moderate</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Traffic: Heavy</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Detailed Status */}
      {detailedStatus && (
        <div className="bg-blue-50 text-blue-800 rounded-md p-2 mb-4 flex items-center gap-2 text-sm">
          <Info className="h-4 w-4" />
          <span>{detailedStatus}</span>
        </div>
      )}
      
      {/* Progress Bar and Countdown */}
      <div className="mb-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress value={etaProgress} className="h-2 bg-gray-200" />
          </div>
          <div className="w-32 text-right text-xs text-gray-600">
            {etaCountdown !== null && etaCountdown > 0 ? (
              <span>
                {Math.floor(etaCountdown / 60)}:{(etaCountdown % 60).toString().padStart(2, '0')} min left
              </span>
            ) : (
              <span>Arriving soon</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <div>{delivery?.pickup_location}</div>
        <div className="border-t border-dashed border-gray-300 grow mx-2 mt-2"></div>
        <div>{delivery?.delivery_location}</div>
      </div>
    </div>
  );
};

export default DeliveryTrackingETA;
