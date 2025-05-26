
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import TrackingSearch from '@/components/tracking/TrackingSearch';
import DeliveryTracking from '@/components/tracking/DeliveryTracking';

const Tracking = () => {
  const [trackingId, setTrackingId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for tracking ID in URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id');
    
    if (idParam) {
      setTrackingId(idParam);
    }
  }, []);
  
  const handleSearch = (id: string) => {
    // Update URL with tracking ID for shareable links
    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    window.history.pushState({}, '', url.toString());
    
    setTrackingId(id);
  };
  
  const handleReset = () => {
    // Clear tracking ID from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.pushState({}, '', url.toString());
    
    setTrackingId(null);
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
            
            {trackingId && (
              <>
                <DeliveryTracking trackingId={trackingId} />
                <div className="mt-8 text-center">
                  <button 
                    onClick={handleReset}
                    className="text-medical-blue hover:text-medical-blue/70 font-medium"
                  >
                    ← Track Another Delivery
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Tracking;
