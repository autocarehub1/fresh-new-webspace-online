import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AlertTriangle, Calendar, ShieldCheck, ThermometerSnowflake, FileText, Clock, Package, Microscope, Pill, Briefcase, Home, PawPrint, Truck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const medicalServices = [
  {
    icon: AlertTriangle,
    title: "Urgent Delivery",
    description: "Critical time-sensitive deliveries with immediate dispatch and priority routing for life-saving situations.",
    details: "Our urgent delivery service ensures that critical medical items reach their destination in the shortest possible time. We maintain a dedicated fleet of vehicles and couriers on standby 24/7 to respond to emergency situations. Our dispatch system prioritizes these deliveries and provides real-time tracking for maximum accountability."
  },
  {
    icon: Calendar,
    title: "Same-Day Delivery",
    description: "Reliable same-day service for specimens, medications and medical documents with precise timing.",
    details: "When you need guaranteed delivery within the same day, our service provides scheduled pickups and deliveries with flexible timing options. Perfect for lab specimens, non-urgent medications, and important documentation that requires prompt handling without the premium cost of emergency service."
  },
  {
    icon: Clock,
    title: "Scheduled Routes",
    description: "Regular scheduled pickups and deliveries customized to your facility's needs and patterns.",
    details: "Our scheduled route service allows healthcare facilities to establish regular pickup and delivery schedules, optimizing efficiency and reducing costs. We work with your team to create custom routes that meet your specific operational requirements, providing consistency and predictability."
  },
  {
    icon: ThermometerSnowflake,
    title: "Temperature-Controlled",
    description: "Specialized transport for temperature-sensitive materials with continuous monitoring.",
    details: "Our temperature-controlled transport solutions maintain precise environmental conditions for sensitive medical items. Each vehicle is equipped with calibrated cooling and heating systems, continuous temperature monitoring, and alert systems. We provide temperature logs with each delivery for complete validation."
  },
  {
    icon: Microscope,
    title: "Specimen Transport",
    description: "Secure and proper handling of laboratory specimens with chain of custody documentation.",
    details: "Our specimen transport service follows strict protocols for handling biological samples. All couriers are trained in proper specimen handling procedures, cross-contamination prevention, and maintaining specimen integrity. Complete chain of custody documentation is provided for regulatory compliance."
  },
  {
    icon: Package,
    title: "Equipment Transport",
    description: "Safe transportation of sensitive medical equipment with appropriate handling protocols.",
    details: "Medical equipment requires special care during transport. Our couriers are trained in proper handling of sensitive instruments and devices, with specialized vehicles featuring suspension systems designed to minimize vibration and impact. We offer crating and padding services for additional protection."
  },
  {
    icon: Pill,
    title: "Pharmaceutical Delivery",
    description: "Secure transport of medications and pharmaceuticals with proper handling and documentation.",
    details: "Our pharmaceutical delivery service ensures that medications are transported securely and efficiently. All couriers undergo background checks and special training for handling controlled substances. We maintain complete chain of custody documentation and offer signature confirmation for all deliveries."
  },
  {
    icon: FileText,
    title: "Document Courier",
    description: "Confidential transport of sensitive medical documents with tracking and security protocols.",
    details: "Our document courier service provides secure transport of confidential medical records and documentation. We use tamper-evident packaging and strict chain of custody procedures to ensure documents remain confidential and secure throughout transport."
  }
];

const baggageServices = [
  {
    icon: Briefcase,
    title: "Airport Baggage Delivery",
    description: "Reliable delivery of luggage and personal items from airports to your destination.",
    details: "Our airport baggage delivery service ensures your luggage reaches your destination safely and on time. We offer both same-day and scheduled delivery options, with real-time tracking and secure handling of your belongings."
  },
  {
    icon: Package,
    title: "Luggage Storage & Delivery",
    description: "Secure storage and delivery of luggage with flexible timing options.",
    details: "Need to store your luggage temporarily? Our secure storage facilities and flexible delivery options make it easy to manage your belongings while you're away. We offer both short-term and long-term storage solutions."
  }
];

const petServices = [
  {
    icon: PawPrint,
    title: "Pet Transportation",
    description: "Safe and comfortable transportation for your pets with specialized care.",
    details: "Our pet transportation service ensures your furry friends travel in comfort and safety. We use climate-controlled vehicles and provide regular updates on your pet's journey. Our staff is trained in pet care and handling."
  },
  {
    icon: Calendar,
    title: "Veterinary Transport",
    description: "Reliable transportation to and from veterinary appointments.",
    details: "Need to get your pet to the vet? Our veterinary transport service provides door-to-door service with careful handling and attention to your pet's needs. We coordinate with veterinary clinics to ensure smooth transitions."
  }
];

const homeServices = [
  {
    icon: Home,
    title: "Furniture Delivery",
    description: "Professional delivery and setup of furniture and home goods.",
    details: "Our furniture delivery service includes careful handling, assembly, and placement of your items. We use specialized equipment to protect your furniture and ensure safe delivery to your home."
  },
  {
    icon: Truck,
    title: "Home Improvement Materials",
    description: "Delivery of construction materials and home improvement supplies.",
    details: "Need materials for your home improvement project? We deliver construction materials, tools, and supplies directly to your location. Our service includes careful handling and placement of heavy items."
  }
];

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-medical-blue py-16 md:py-24 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Our Delivery Services</h1>
              <p className="text-xl">
                Comprehensive delivery solutions for medical, baggage, pets, and home improvement needs with an emphasis on reliability, safety, and customer satisfaction.
              </p>
            </div>
          </div>
        </section>

        {/* Services Tabs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="medical" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-8">
                <TabsTrigger value="medical">Medical Delivery</TabsTrigger>
                <TabsTrigger value="baggage">Baggage Delivery</TabsTrigger>
                <TabsTrigger value="pet">Pet Delivery</TabsTrigger>
                <TabsTrigger value="home">Home Improvement</TabsTrigger>
              </TabsList>

              <TabsContent value="medical">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {medicalServices.map((service, index) => (
                    <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-medical-blue/10 flex items-center justify-center">
                            <service.icon className="text-medical-blue h-6 w-6" />
                          </div>
                          <CardTitle className="text-2xl text-medical-blue">{service.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-500 mb-4">{service.description}</p>
                        <p className="text-gray-700">{service.details}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" className="text-medical-blue hover:bg-medical-blue/5">
                          <Link to={`/request-pickup?service=${service.title}`}>Request This Service</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="baggage">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {baggageServices.map((service, index) => (
                    <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-medical-blue/10 flex items-center justify-center">
                            <service.icon className="text-medical-blue h-6 w-6" />
                          </div>
                          <CardTitle className="text-2xl text-medical-blue">{service.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-500 mb-4">{service.description}</p>
                        <p className="text-gray-700">{service.details}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" className="text-medical-blue hover:bg-medical-blue/5">
                          <Link to={`/request-pickup?service=${service.title}`}>Request This Service</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="pet">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {petServices.map((service, index) => (
                    <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-medical-blue/10 flex items-center justify-center">
                            <service.icon className="text-medical-blue h-6 w-6" />
                          </div>
                          <CardTitle className="text-2xl text-medical-blue">{service.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-500 mb-4">{service.description}</p>
                        <p className="text-gray-700">{service.details}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" className="text-medical-blue hover:bg-medical-blue/5">
                          <Link to={`/request-pickup?service=${service.title}`}>Request This Service</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="home">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {homeServices.map((service, index) => (
                    <Card key={index} className="border-gray-200 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-medical-blue/10 flex items-center justify-center">
                            <service.icon className="text-medical-blue h-6 w-6" />
                          </div>
                          <CardTitle className="text-2xl text-medical-blue">{service.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-500 mb-4">{service.description}</p>
                        <p className="text-gray-700">{service.details}</p>
                      </CardContent>
                      <CardFooter>
                        <Button asChild variant="outline" className="text-medical-blue hover:bg-medical-blue/5">
                          <Link to={`/request-pickup?service=${service.title}`}>Request This Service</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-medical-teal text-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-6 md:mb-0">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Ready to experience our services?</h2>
                <p className="text-white/80">
                  Contact us today to discuss your delivery needs
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="default" className="bg-white text-medical-teal hover:bg-gray-100">
                  <Link to="/request-pickup">Request Pickup</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <Link to="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
