
import { 
  Zap, 
  Shield, 
  MapPin, 
  Bell, 
  ThermometerSnowflake, 
  FileText,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: "Rapid Response Times",
    description: "Our strategically located couriers ensure the fastest possible pickup times in San Antonio, with emergency response averaging under 30 minutes."
  },
  {
    icon: MapPin,
    title: "Real-Time GPS Tracking",
    description: "Monitor your deliveries in real-time with our advanced GPS tracking system, providing precise location updates and ETA information."
  },
  {
    icon: ThermometerSnowflake,
    title: "Temperature Monitoring",
    description: "Continuous temperature monitoring for sensitive specimens and pharmaceuticals, with automated alerts for any deviations."
  },
  {
    icon: Shield,
    title: "HIPAA Compliance",
    description: "Fully HIPAA-compliant processes and handling protocols, with comprehensive training for all couriers and staff."
  },
  {
    icon: Bell,
    title: "Automated Notifications",
    description: "Receive automated updates at every step of the delivery process, from pickup confirmation to delivery verification."
  },
  {
    icon: FileText,
    title: "Chain of Custody",
    description: "Complete digital documentation of chain of custody, with electronic signatures and timestamped verification."
  },
  {
    icon: CheckCircle2,
    title: "Delivery Confirmation",
    description: "Secure electronic delivery confirmation with photo verification and recipient information for complete accountability."
  },
  {
    icon: TrendingUp,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics dashboard for clients, tracking performance metrics, delivery times, and service patterns."
  }
];

export const Features = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-medical-blue mb-4">Advanced Features for Healthcare Logistics</h2>
          <p className="text-gray-600">
            Our technology-driven approach ensures reliable, trackable, and compliant medical courier services tailored specifically for San Antonio's healthcare community.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-start">
              <div className="rounded-lg bg-medical-blue/10 p-3 mb-4">
                <feature.icon className="h-6 w-6 text-medical-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
