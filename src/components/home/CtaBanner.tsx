import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

export const CtaBanner = () => {
  return (
    <section className="bg-medical-teal text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Need urgent logistics service?</h2>
            <p className="text-white/80">
              Our professional dispatch team is available 24/7 for time-sensitive deliveries
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" variant="default" className="bg-white text-medical-teal hover:bg-gray-100">
              <Link to="/request-pickup">Request Pickup</Link>
            </Button>
            <Button asChild size="lg" variant="default" className="bg-medical-blue text-white hover:bg-medical-blue/90 font-bold">
              <a href="tel:4322022150">
                <Phone size={20} className="mr-2" />
                (432)-202-2150
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
