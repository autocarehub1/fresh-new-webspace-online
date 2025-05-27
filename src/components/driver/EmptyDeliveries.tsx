
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

const EmptyDeliveries: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="text-center py-8">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">No active deliveries assigned</p>
          <p className="text-sm text-gray-400">
            New deliveries will appear here when assigned by dispatch
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyDeliveries;
