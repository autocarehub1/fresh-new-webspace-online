import React from 'react';
import { Package, Truck, MapPin, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { DeliveryRequest, TrackingUpdate } from '@/types/delivery';

interface TrackingTimelineProps {
  delivery: DeliveryRequest;
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

// Get appropriate icon based on update status
const getStatusIcon = (status: string, index: number, isLast: boolean) => {
  status = status.toLowerCase();
  
  if (status.includes('delivered') || status.includes('completed')) {
    return <CheckCircle size={16} />;
  } else if (status.includes('driver') || status.includes('en route')) {
    return <Truck size={16} />;
  } else if (status.includes('pending') || status.includes('scheduled')) {
    return <Clock size={16} />;
  } else if (status.includes('urgent') || status.includes('delay')) {
    return <AlertTriangle size={16} />;
  } else if (isLast) {
    return <Truck size={16} />;
  } else if (index === 0) {
    return <Package size={16} />;
  } else {
    return <MapPin size={16} />;
  }
};

const TrackingTimeline = ({ delivery }: TrackingTimelineProps) => {
  const updates = delivery?.tracking_updates || [];
  
  if (updates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No tracking updates available yet.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {updates.map((update, index) => {
        const isLast = index === updates.length - 1;
        const icon = getStatusIcon(update.status, index, isLast);
        
        // Determine status color
        let statusColor = "text-medical-blue";
        let bgColor = "bg-medical-blue/10";
        
        if (update.status.toLowerCase().includes('delivered') || update.status.toLowerCase().includes('completed')) {
          statusColor = "text-green-600";
          bgColor = "bg-green-100";
        } else if (update.status.toLowerCase().includes('driver') || update.status.toLowerCase().includes('en route')) {
          statusColor = "text-amber-600";
          bgColor = "bg-amber-100";
        } else if (update.status.toLowerCase().includes('urgent') || update.status.toLowerCase().includes('delay')) {
          statusColor = "text-medical-red";
          bgColor = "bg-medical-red/10";
        }
        
        return (
          <div key={index} className="flex gap-4">
            <div className="relative flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full ${bgColor} ${statusColor} flex items-center justify-center`}>
                {icon}
              </div>
              {index < updates.length - 1 && (
                <div className="w-0.5 bg-gray-200 h-full absolute top-8"></div>
              )}
            </div>
            <div className="pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                <p className={`font-medium ${statusColor}`}>{update.status}</p>
                <p className="text-sm text-gray-500">{formatDateTime(update.timestamp)}</p>
              </div>
              <p className="text-sm text-gray-600 mb-1">{update.location}</p>
              <p className="text-sm">{update.note}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrackingTimeline;
