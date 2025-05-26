import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  Calendar, 
  ShieldCheck, 
  ThermometerSnowflake, 
  FileText, 
  Clock, 
  Package,
  Microscope, 
  Pill,
  Briefcase,
  Home,
  PawPrint,
  Truck
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    icon: AlertTriangle,
    title: "Medical Delivery",
    description: "Specialized medical courier services for healthcare facilities.",
    link: "/services#medical"
  },
  {
    icon: Briefcase,
    title: "Baggage Delivery",
    description: "Reliable airport baggage and luggage delivery services.",
    link: "/services#baggage"
  },
  {
    icon: PawPrint,
    title: "Pet Delivery",
    description: "Safe and comfortable transportation for your pets.",
    link: "/services#pet"
  },
  {
    icon: Home,
    title: "Home Improvement",
    description: "Delivery of furniture and construction materials.",
    link: "/services#home"
  }
];

export const Services = () => {
  return (
    <section className="py-16 bg-medical-lightGray">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-medical-blue mb-4">Our Delivery Services</h2>
          <p className="text-gray-600">
            From medical supplies to pets, baggage, and home improvement materials, we provide comprehensive delivery solutions with a focus on reliability and customer satisfaction.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card key={index} className="border-gray-200 hover:border-medical-blue transition-colors">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4">
                  <service.icon className="text-medical-blue h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="ghost" className="text-medical-blue hover:text-medical-teal hover:bg-medical-blue/5">
                  <Link to={service.link}>Learn more</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <Link to="/services">View All Services</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Services;
