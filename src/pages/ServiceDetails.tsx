
import { useParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const serviceData = {
  'urgent': {
    title: 'Urgent Medical Delivery',
    description: 'Our urgent medical delivery service ensures critical medical supplies reach their destination within 1-2 hours of your request.',
    pricing: {
      baseRate: '$75 per delivery',
      mileageRate: '$3.50 per mile',
      additionalFees: [
        'After-hours surcharge: $25',
        'Holiday surcharge: $50',
        'Hazardous materials handling: $35'
      ]
    },
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
    pricing: {
      baseRate: '$35 per delivery',
      mileageRate: '$2.50 per mile',
      additionalFees: [
        'Multi-stop discount available',
        'Weekend service: $15 surcharge',
        'Waiting time: $15 per 15 minutes'
      ]
    },
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
    pricing: {
      baseRate: '$250 per week',
      mileageRate: 'Included in base rate',
      additionalFees: [
        'Extra stops: $10 each',
        'Route modification: $25',
        'Volume discounts available'
      ]
    },
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
    pricing: {
      baseRate: '$45 per delivery',
      mileageRate: '$3.00 per mile',
      additionalFees: [
        'Temperature monitoring: $15',
        'Specialized packaging: $25-45',
        'Temperature documentation: $10'
      ]
    },
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
    pricing: {
      baseRate: '$40 per delivery',
      mileageRate: '$2.75 per mile',
      additionalFees: [
        'Biohazard handling: $20',
        'Rush processing: $30',
        'Chain of custody documentation: $15'
      ]
    },
    features: [
      'Specialized training for biohazard handling',
      'Proper specimen packaging verification',
      'Temperature-controlled transport options',
      'Chain of custody documentation',
      'Lab-direct delivery capabilities',
      'Compliance with all regulatory requirements'
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
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-medical-blue mb-4">Pricing Information</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="font-semibold mb-2">Base Rates</h3>
                    <p className="text-lg text-medical-blue font-bold mb-1">{service.pricing.baseRate}</p>
                    <p className="text-sm text-gray-600">{service.pricing.mileageRate}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Additional Fees</h3>
                    <ul className="space-y-1 text-sm text-gray-600">
                      {service.pricing.additionalFees.map((fee, index) => (
                        <li key={index}>{fee}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
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
            <p className="mb-4">Need this service for your medical facility? Contact us to discuss your specific requirements or schedule a pickup.</p>
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
