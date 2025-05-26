
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, MapPin } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-medical-blue to-medical-blue-light text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <img 
              src="/lovable-uploads/49b6466e-7267-4a9d-a03c-5b25317f80a4.png" 
              alt="Catalyst Network Logistics" 
              className="h-16 w-auto mx-auto mb-6 filter brightness-0 invert"
            />
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Professional Medical Courier Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Secure, reliable, and HIPAA-compliant delivery solutions for healthcare providers across San Antonio
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="bg-medical-teal hover:bg-medical-teal/90 text-white">
              <Link to="/request-pickup" className="gap-2">
                Request Pickup <ArrowRight size={20} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-medical-blue">
              <Link to="/tracking">
                Track Delivery
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 mb-4 text-medical-teal" />
              <h3 className="text-lg font-semibold mb-2">HIPAA Compliant</h3>
              <p className="text-gray-200">Secure handling of all medical specimens and documents</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="h-12 w-12 mb-4 text-medical-teal" />
              <h3 className="text-lg font-semibold mb-2">24/7 Emergency</h3>
              <p className="text-gray-200">Round-the-clock urgent delivery services</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="h-12 w-12 mb-4 text-medical-teal" />
              <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-200">Live updates on your delivery status and location</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
