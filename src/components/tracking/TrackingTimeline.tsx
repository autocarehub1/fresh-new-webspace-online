
import React from 'react';
import { Package, Truck, MapPin } from 'lucide-react';
import { TrackingUpdate } from '@/types/delivery';

interface TrackingTimelineProps {
  updates: TrackingUpdate[];
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', { 
    month: 'short',
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true
  });
};

const TrackingTimeline = ({ updates }: TrackingTimelineProps) => {
  return (
    <div className="space-y-6">
      {updates?.map((update, index) => (
        <div key={index} className="flex gap-4">
          <div className="relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-medical-blue/10 text-medical-blue flex items-center justify-center">
              {index === 0 ? <Package size={16} /> : 
               index === (updates?.length || 0) - 1 ? <Truck size={16} /> : 
               <MapPin size={16} />}
            </div>
            {index < (updates?.length || 0) - 1 && (
              <div className="w-0.5 bg-gray-200 h-full absolute top-8"></div>
            )}
          </div>
          <div className="pb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
              <p className="font-medium">{update.status}</p>
              <p className="text-sm text-gray-500">{formatDateTime(update.timestamp)}</p>
            </div>
            <p className="text-sm text-gray-600 mb-1">{update.location}</p>
            <p className="text-sm">{update.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrackingTimeline;
