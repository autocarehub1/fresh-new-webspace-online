
import React from 'react';
import { Button } from '@/components/ui/button';
import { DeliveryRequest } from '@/types/delivery';

interface CourierInfoProps {
  delivery: DeliveryRequest;
}

const CourierInfo = ({ delivery }: CourierInfoProps) => {
  return (
    <>
      {delivery.courier ? (
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
      ) : (
        <p className="text-center text-gray-600">No courier assigned yet</p>
      )}
    </>
  );
};

export default CourierInfo;
