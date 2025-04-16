
import { useState } from 'react';
import { Check, Clock, Package, Truck, MapPin, CircleDashed, ThermometerSnowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock delivery data
const mockDeliveryData = {
  trackingId: 'EMD-8294716',
  status: 'in-transit',
  priority: 'urgent',
  pickupTime: '2023-07-18T10:45:00',
  estimatedDelivery: '2023-07-18T12:10:00',
  pickupLocation: {
    name: 'UT Health San Antonio',
    address: '7703 Floyd Curl Dr, San Antonio, TX 78229'
  },
  deliveryLocation: {
    name: 'Methodist Hospital Laboratory',
    address: '7700 Floyd Curl Dr, San Antonio, TX 78229'
  },
  packageType: 'Medical Specimen',
  temperature: {
    required: '2-8°C',
    current: '4.3°C',
    status: 'normal'
  },
  trackingUpdates: [
    { 
      status: 'Pickup requested', 
      timestamp: '2023-07-18T10:15:00',
      location: 'Online System',
      note: 'Pickup requested by Dr. Martinez'
    },
    { 
      status: 'Courier assigned', 
      timestamp: '2023-07-18T10:18:00',
      location: 'Dispatch Center',
      note: 'Courier John D. assigned to pickup'
    },
    { 
      status: 'En route to pickup', 
      timestamp: '2023-07-18T10:20:00',
      location: 'San Antonio Medical District',
      note: 'Estimated arrival in 25 minutes'
    },
    { 
      status: 'Arrived at pickup', 
      timestamp: '2023-07-18T10:40:00',
      location: 'UT Health San Antonio',
      note: 'Courier at reception desk'
    },
    { 
      status: 'Package picked up', 
      timestamp: '2023-07-18T10:45:00',
      location: 'UT Health San Antonio',
      note: 'Specimen picked up, chain of custody signed by Dr. Martinez'
    },
    { 
      status: 'In transit to delivery', 
      timestamp: '2023-07-18T10:52:00',
      location: 'San Antonio Medical District',
      note: 'Temperature monitored, within required range'
    }
  ],
  courier: {
    name: 'John Dominguez',
    phone: '(210) 555-4567',
    photo: 'https://randomuser.me/api/portraits/men/32.jpg',
    vehicle: 'Toyota Prius #EMD-12'
  }
};

const getStatusStep = (status: string) => {
  switch(status) {
    case 'requested': return 0;
    case 'assigned': return 1;
    case 'picked-up': return 2;
    case 'in-transit': return 3;
    case 'delivered': return 4;
    default: return 3; // Default to in-transit for demo
  }
};

export const DeliveryTracking = ({ trackingId }: { trackingId: string }) => {
  const [delivery, setDelivery] = useState(mockDeliveryData);
  const statusStep = getStatusStep(delivery.status);
  
  // Format dates
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { 
      month: 'short',
      day: 'numeric', 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-2xl font-bold">Tracking #{delivery.trackingId}</h2>
            {delivery.priority === 'urgent' && (
              <span className="bg-medical-red/10 text-medical-red text-xs font-semibold px-2.5 py-0.5 rounded">
                URGENT
              </span>
            )}
          </div>
          <p className="text-gray-600">
            Estimated delivery by {formatTime(delivery.estimatedDelivery)}
          </p>
        </div>
        <Button asChild variant="outline" className="mt-4 md:mt-0">
          <a href="#">Download Receipt</a>
        </Button>
      </div>
      
      {/* Status Timeline */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex justify-between mb-8">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${statusStep >= 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center mb-2`}>
                <Package size={20} />
              </div>
              <p className="text-xs text-center font-medium">Requested</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-1 w-full ${statusStep >= 1 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${statusStep >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center mb-2`}>
                <Truck size={20} />
              </div>
              <p className="text-xs text-center font-medium">Assigned</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-1 w-full ${statusStep >= 2 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${statusStep >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center mb-2`}>
                <Clock size={20} />
              </div>
              <p className="text-xs text-center font-medium">Picked Up</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-1 w-full ${statusStep >= 3 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${statusStep >= 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center mb-2`}>
                <CircleDashed size={20} className={statusStep === 3 ? "animate-spin" : ""} />
              </div>
              <p className="text-xs text-center font-medium">In Transit</p>
            </div>
            <div className="flex-1 flex items-center">
              <div className={`h-1 w-full ${statusStep >= 4 ? 'bg-green-500' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full ${statusStep >= 4 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'} flex items-center justify-center mb-2`}>
                <Check size={20} />
              </div>
              <p className="text-xs text-center font-medium">Delivered</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pickup Location */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Pickup</h3>
              <p className="font-medium">{delivery.pickupLocation.name}</p>
              <p className="text-sm text-gray-600">{delivery.pickupLocation.address}</p>
            </div>
            
            {/* Package Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Package</h3>
              <p className="font-medium">{delivery.packageType}</p>
              <div className="flex items-center gap-1 mt-1">
                <ThermometerSnowflake size={16} className="text-blue-500" />
                <p className="text-sm">
                  <span className={delivery.temperature.status === 'normal' ? 'text-green-600' : 'text-medical-red'}>
                    {delivery.temperature.current}
                  </span>
                  <span className="text-gray-500"> (Required: {delivery.temperature.required})</span>
                </p>
              </div>
            </div>
            
            {/* Delivery Location */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Delivery</h3>
              <p className="font-medium">{delivery.deliveryLocation.name}</p>
              <p className="text-sm text-gray-600">{delivery.deliveryLocation.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Courier Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Courier Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                <img src={delivery.courier.photo} alt="Courier" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-lg font-medium">{delivery.courier.name}</h3>
              <p className="text-gray-600 mb-4">{delivery.courier.vehicle}</p>
              <Button asChild variant="outline" size="sm" className="w-full">
                <a href={`tel:${delivery.courier.phone}`}>{delivery.courier.phone}</a>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Tracking Updates */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Delivery Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {delivery.trackingUpdates.map((update, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-medical-blue/10 text-medical-blue flex items-center justify-center">
                      {index === 0 ? <Package size={16} /> : 
                       index === delivery.trackingUpdates.length - 1 ? <Truck size={16} /> : 
                       <MapPin size={16} />}
                    </div>
                    {index < delivery.trackingUpdates.length - 1 && (
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
          </CardContent>
        </Card>
      </div>
      
      {/* Map placeholder - would integrate with real map in production */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Real-Time Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-md h-64 flex items-center justify-center">
            <p className="text-gray-500">Map integration would show real-time courier location</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryTracking;
