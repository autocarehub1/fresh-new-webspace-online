import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const serviceData = {
  // Medical Services
  'urgent': {
    title: 'Urgent Medical Delivery',
    description: 'Our urgent medical delivery service ensures critical medical supplies reach their destination within 1-2 hours of your request.',
    features: [
      'Priority routing and dispatch',
      'Real-time GPS tracking',
      'Direct driver communication',
      'Guaranteed delivery timeframes',
      'Temperature-controlled vehicles available',
      'HIPAA-compliant chain of custody'
    ]
  },
  'same-day': {
    title: 'Same-Day Medical Delivery',
    description: 'Reliable same-day delivery for non-urgent but time-sensitive medical supplies and specimens.',
    features: [
      'Multiple pickups consolidated into single delivery',
      'Scheduled delivery windows',
      'Cost-effective routing',
      'Full tracking capabilities',
      'Electronic proof of delivery',
      'HIPAA-compliant processes'
    ]
  },
  'scheduled': {
    title: 'Scheduled Route Medical Delivery',
    description: 'Pre-planned, recurring delivery routes for regular medical supply and specimen transport needs.',
    features: [
      'Weekly, daily, or custom recurring schedules',
      'Consistent driver assignments',
      'Optimized multi-stop routing',
      'Volume discounting available',
      'Dedicated account management',
      'Performance reporting'
    ]
  },
  'temperature-controlled': {
    title: 'Temperature-Controlled Medical Delivery',
    description: 'Specialized delivery service maintaining precise temperature requirements for sensitive medical items.',
    features: [
      'Validated temperature-controlled vehicles',
      'Temperature monitoring throughout transit',
      'Temperature verification at delivery',
      'Specialized packaging options',
      'Compliance with cold chain requirements',
      'Temperature documentation and reporting'
    ]
  },
  'specimen': {
    title: 'Specimen Transport',
    description: 'Dedicated specimen transport with strict adherence to handling protocols and chain of custody requirements.',
    features: [
      'Specialized training for biohazard handling',
      'Proper specimen packaging verification',
      'Temperature-controlled transport options',
      'Chain of custody documentation',
      'Lab-direct delivery capabilities',
      'Compliance with all regulatory requirements'
    ]
  },

  // Baggage Services
  'airport-baggage': {
    title: 'Airport Baggage Delivery',
    description: 'Reliable delivery of luggage and personal items from airports to your destination.',
    features: [
      'Airport pickup coordination',
      'Real-time tracking',
      'Secure handling of luggage',
      'Flexible delivery scheduling',
      'Insurance coverage available',
      '24/7 customer support'
    ]
  },
  'luggage-storage': {
    title: 'Luggage Storage & Delivery',
    description: 'Secure storage and delivery of luggage with flexible timing options.',
    features: [
      'Secure storage facilities',
      'Short-term and long-term options',
      'Flexible pickup and delivery times',
      'Climate-controlled storage',
      'Insurance coverage',
      '24/7 facility monitoring'
    ]
  },

  // Pet Services
  'pet-transportation': {
    title: 'Pet Transportation',
    description: 'Safe and comfortable transportation for your pets with specialized care.',
    features: [
      'Climate-controlled vehicles',
      'Regular comfort breaks',
      'Experienced pet handlers',
      'Real-time journey updates',
      'Secure pet carriers provided',
      'Emergency vet contact available'
    ]
  },
  'veterinary-transport': {
    title: 'Veterinary Transport',
    description: 'Reliable transportation to and from veterinary appointments.',
    features: [
      'Door-to-door service',
      'Careful handling of pets',
      'Veterinary clinic coordination',
      'Comfortable transport vehicles',
      'Emergency response capability',
      'Trained pet handlers'
    ]
  },

  // Home Services
  'furniture-delivery': {
    title: 'Furniture Delivery',
    description: 'Professional delivery and setup of furniture and home goods.',
    features: [
      'Careful handling and assembly',
      'White glove delivery service',
      'Furniture placement assistance',
      'Packaging removal and disposal',
      'Damage protection coverage',
      'Scheduled delivery windows'
    ]
  },
  'home-improvement': {
    title: 'Home Improvement Materials',
    description: 'Delivery of construction materials and home improvement supplies.',
    features: [
      'Heavy material handling',
      'Equipment for safe unloading',
      'Placement assistance',
      'Scheduled delivery times',
      'Material protection during transit',
      'Professional handling team'
    ]
  }
};

const ServiceDetails = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const service = serviceType && serviceData[serviceType as keyof typeof serviceData];
  
  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Service Not Found</h1>
            <p>The requested service information is not available.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-medical-blue mb-6">{service.title}</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <p className="text-lg mb-6">{service.description}</p>
            
            <h2 className="text-xl font-semibold text-medical-blue mb-4">Service Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {service.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="mr-2 mt-1 text-medical-teal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-medical-blue-light/10 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-medical-blue mb-4">Request This Service</h2>
            <p className="mb-4">Ready to use this service? Contact us to discuss your specific requirements or schedule a pickup.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/request-pickup" className="bg-medical-blue text-white py-2 px-4 rounded hover:bg-medical-blue-dark transition-colors text-center">
                Request Pickup
              </a>
              <a href="/contact" className="bg-white border border-medical-blue text-medical-blue py-2 px-4 rounded hover:bg-gray-50 transition-colors text-center">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetails;
