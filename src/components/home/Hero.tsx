
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Shield, ThermometerSnowflake, MapPin, Navigation } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-medical-blue to-medical-teal text-white py-16 md:py-24 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjZmZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjMiIGN5PSIzIiByPSIzIi8+PC9nPjwvc3ZnPg==')]"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Medical Courier Excellence in San Antonio
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-100">
            Specialized transportation for medical specimens, pharmaceuticals, and sensitive documents with real-time tracking and HIPAA compliance.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-white text-medical-blue hover:bg-gray-100">
              <Link to="/request-pickup">Request Pickup</Link>
            </Button>
            <Button asChild size="lg" variant="default" className="bg-medical-teal hover:bg-medical-blue border-2 border-white">
              <Link to="/tracking">Track Delivery</Link>
            </Button>
          </div>
          
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <AlertCircle size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium">Priority Response</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <ThermometerSnowflake size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium">Temperature Control</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <Shield size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2">
                <Clock size={20} className="text-white" />
              </div>
              <span className="text-sm font-medium">24/7 Service</span>
            </div>
          </div>

          {/* New tracking capabilities section */}
          <div className="mt-12 bg-white/10 p-6 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <MapPin className="text-white w-8 h-8" />
              <Navigation className="text-white w-8 h-8" />
              <h3 className="text-xl font-semibold">Real-Time Tracking</h3>
            </div>
            <p className="text-gray-200">
              Track your medical deliveries with precision. Our advanced tracking system provides real-time location updates, estimated delivery times, and instant notifications to keep you informed every step of the way.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
