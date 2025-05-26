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
  // Sort updates to match the order in the screenshot and RequestDetailsDialog
  const sortedUpdates = React.useMemo(() => {
    const updates = delivery?.tracking_updates || [];
    return [...updates].sort((a, b) => {
      // Define the exact status order based on the screenshot
      const statusPriority = {
        'Delivered': 1,
        'In Transit': 2,
        'Picked Up': 3,
        'Driver Assigned': 4,
        'Request Approved': 5,
        'Request Submitted': 6
      };
      
      // Get the priority for each status
      const priorityA = statusPriority[a.status] || 999;
      const priorityB = statusPriority[b.status] || 999;
      
      // First sort by priority
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      // If same status type, sort by timestamp (newest first)
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }, [delivery?.tracking_updates]);
  
  if (sortedUpdates.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No tracking updates available yet.
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {sortedUpdates.map((update, index) => {
        const isLast = index === sortedUpdates.length - 1;
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
              {index < sortedUpdates.length - 1 && (
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
