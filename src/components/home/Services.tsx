
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
  Pill
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    icon: AlertTriangle,
    title: "Urgent Delivery",
    description: "Critical time-sensitive deliveries with immediate dispatch and priority routing for life-saving situations.",
    pricing: "Starting at $75 per delivery",
    priceDetails: "Base rate plus $3.50/mile",
    link: "/services/urgent"
  },
  {
    icon: Calendar,
    title: "Same-Day Delivery",
    description: "Reliable same-day service for specimens, medications and medical documents with precise timing.",
    pricing: "Starting at $35 per delivery",
    priceDetails: "Base rate plus $2.50/mile",
    link: "/services/same-day"
  },
  {
    icon: Clock,
    title: "Scheduled Routes",
    description: "Regular scheduled pickups and deliveries customized to your facility's needs and patterns.",
    pricing: "Starting at $250/week",
    priceDetails: "Custom quotes for route frequency",
    link: "/services/scheduled"
  },
  {
    icon: ThermometerSnowflake,
    title: "Temperature-Controlled",
    description: "Specialized transport for temperature-sensitive materials with continuous monitoring.",
    pricing: "Starting at $45 per delivery",
    priceDetails: "Base rate plus $3.00/mile",
    link: "/services/temperature-controlled"
  },
  {
    icon: Microscope,
    title: "Specimen Transport",
    description: "Secure and proper handling of laboratory specimens with chain of custody documentation.",
    pricing: "Starting at $40 per delivery",
    priceDetails: "Base rate plus $2.75/mile",
    link: "/services/specimen"
  },
  {
    icon: Package,
    title: "Equipment Transport",
    description: "Safe transportation of sensitive medical equipment with appropriate handling protocols.",
    pricing: "Starting at $85 per delivery",
    priceDetails: "Custom quote based on equipment",
    link: "/services/equipment"
  },
  {
    icon: Pill,
    title: "Pharmaceutical Delivery",
    description: "Secure transport of medications and pharmaceuticals with proper handling and documentation.",
    pricing: "Starting at $45 per delivery",
    priceDetails: "Base rate plus $2.75/mile",
    link: "/services/pharmaceutical"
  },
  {
    icon: FileText,
    title: "Document Courier",
    description: "Confidential transport of sensitive medical documents with tracking and security protocols.",
    pricing: "Starting at $25 per delivery",
    priceDetails: "Base rate plus $2.00/mile",
    link: "/services/document"
  }
];

export const Services = () => {
  return (
    <section className="py-16 bg-medical-lightGray">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-medical-blue mb-4">Specialized Medical Courier Services</h2>
          <p className="text-gray-600">
            Our specialized courier services are designed to meet the unique needs of healthcare facilities in San Antonio, with emphasis on reliability, compliance, and speed.
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
                <div className="space-y-1">
                  <p className="text-medical-blue font-semibold">{service.pricing}</p>
                  <p className="text-xs text-gray-500">{service.priceDetails}</p>
                </div>
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
