
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

export const CtaBanner = () => {
  return (
    <section className="bg-medical-teal text-white py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Need an urgent medical pickup?</h2>
            <p className="text-white/80">
              Our emergency response team is available 24/7 for critical medical deliveries
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild size="lg" variant="default" className="bg-white text-medical-teal hover:bg-gray-100">
              <Link to="/request-pickup">Request Pickup</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <a href="tel:2105550123">
                <Phone size={20} className="mr-2" />
                (210) 555-0123
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaBanner;
