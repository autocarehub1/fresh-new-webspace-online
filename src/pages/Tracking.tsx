
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TrackingSearch from '@/components/tracking/TrackingSearch';
import DeliveryTracking from '@/components/tracking/DeliveryTracking';

const Tracking = () => {
  const [trackingId, setTrackingId] = useState<string | null>(null);
  
  const handleSearch = (id: string) => {
    setTrackingId(id);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-medical-lightGray py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-medical-blue text-center">Track Your Delivery</h1>
            <p className="text-gray-600 mb-8 text-center">
              Enter your tracking number to see real-time status and location information.
            </p>
            
            {!trackingId && <TrackingSearch onSearch={handleSearch} />}
            
            {trackingId && <DeliveryTracking trackingId={trackingId} />}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tracking;
