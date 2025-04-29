import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, ThumbsUp, Users, Truck, FileText, TestTube, Pill, Hospital } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-medical-blue py-16 md:py-24 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About Us</h1>
              <p className="text-xl">
                Catalyst Network Logistics is a trusted medical courier service based in San Antonio, Texas, dedicated to delivering critical healthcare logistics with precision, care, and speed.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-medical-blue mb-6">Who We Are</h2>
              <p className="text-gray-700 mb-4">
                As a locally owned and operated 2-member LLC, we are driven by a shared mission: to be the vital link between healthcare providers, laboratories, and patients—ensuring that time-sensitive and life-saving materials reach their destinations safely and on time.
              </p>
              <p className="text-gray-700 mb-4">
                Founded by two passionate professionals with backgrounds in healthcare logistics and business operations, Catalyst Network Logistics was born out of the need for consistent, accountable, and HIPAA-compliant transport solutions. We understand the critical nature of every specimen, document, and piece of equipment we handle. With every delivery, we uphold our commitment to accuracy, discretion, and professionalism.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-medical-lightGray">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-medical-blue mb-6">Our Mission</h2>
              <p className="text-gray-700 text-xl italic">
                "To provide reliable, secure, and timely courier services that support the medical community and enhance patient outcomes across San Antonio and surrounding regions."
              </p>
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-medical-blue mb-8">What We Do</h2>
              <p className="text-gray-700 mb-6">
                We specialize in the secure transport of:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-start gap-3">
                  <TestTube className="text-medical-blue h-6 w-6 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Lab specimens and diagnostic samples</p>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="text-medical-blue h-6 w-6 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Medical equipment and devices</p>
                </div>
                <div className="flex items-start gap-3">
                  <Pill className="text-medical-blue h-6 w-6 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Pharmaceuticals and prescriptions</p>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="text-medical-blue h-6 w-6 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Healthcare documents and records</p>
                </div>
                <div className="flex items-start gap-3">
                  <Hospital className="text-medical-blue h-6 w-6 flex-shrink-0 mt-1" />
                  <p className="text-gray-700">Hospital-to-clinic supply transfers</p>
                </div>
              </div>
              
              <p className="text-gray-700">
                Whether it's a routine pickup or an urgent, time-sensitive delivery, we tailor our services to meet the unique needs of our healthcare partners.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-medical-lightGray">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-medical-blue mb-12 text-center">Why Choose Us?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <ShieldCheck className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">HIPAA-Compliant</h3>
                <p className="text-gray-600 text-center">
                  We handle all items with the utmost respect for privacy and security.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <Clock className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Real-Time Tracking</h3>
                <p className="text-gray-600 text-center">
                  Know where your package is, every step of the way.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <Users className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Locally Owned & Operated</h3>
                <p className="text-gray-600 text-center">
                  We know San Antonio—and we care deeply about our community.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <ThumbsUp className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Flexible Scheduling</h3>
                <p className="text-gray-600 text-center">
                  Same-day, scheduled, and on-demand delivery options available.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <Truck className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Professionalism First</h3>
                <p className="text-gray-600 text-center">
                  Our team is uniformed, insured, background-checked, and trained for medical logistics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Serving San Antonio Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-medical-blue mb-6">Serving San Antonio and Beyond</h2>
              <p className="text-gray-700 mb-8">
                While we're proud to call San Antonio home, our services extend to clinics, labs, hospitals, pharmacies, and medical practices throughout Central and South Texas.
              </p>
              <Button asChild size="lg" variant="default" className="bg-medical-blue hover:bg-medical-blue/90">
                <Link to="/contact">Contact Us Today</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
