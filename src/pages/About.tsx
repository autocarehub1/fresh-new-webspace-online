
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Clock, ShieldCheck, ThumbsUp, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-medical-blue py-16 md:py-24 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">About ExpressMed Dispatch</h1>
              <p className="text-xl">
                San Antonio's premier medical courier service, dedicated to supporting healthcare providers with reliable, compliant transportation solutions.
              </p>
            </div>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-medical-blue mb-6">Our Story</h2>
              <p className="text-gray-700 mb-4">
                ExpressMed Dispatch was founded in 2018 by a team of healthcare logistics professionals who recognized the critical need for specialized medical courier services in the San Antonio area. With backgrounds spanning hospital administration, laboratory services, and logistics management, our founding team combined their expertise to create a service specifically designed for healthcare transportation needs.
              </p>
              <p className="text-gray-700 mb-4">
                What began as a small operation with three vehicles has grown into a comprehensive medical courier service with a fleet of specialized vehicles and a team of trained professionals serving healthcare facilities throughout the San Antonio metropolitan area.
              </p>
              <p className="text-gray-700">
                Today, ExpressMed Dispatch is trusted by hospitals, laboratories, clinics, and pharmaceutical companies to transport their most sensitive and time-critical materials. Our commitment to reliability, compliance, and customer service has made us the preferred partner for healthcare logistics in the region.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-medical-lightGray">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-medical-blue mb-12 text-center">Our Core Values</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <Clock className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Reliability</h3>
                <p className="text-gray-600 text-center">
                  We understand that timing is critical in healthcare. Our services are designed to deliver consistently and punctually, every time.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <ShieldCheck className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Compliance</h3>
                <p className="text-gray-600 text-center">
                  We maintain the highest standards of regulatory compliance, including HIPAA, OSHA, and DOT requirements for medical transport.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <ThumbsUp className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Quality</h3>
                <p className="text-gray-600 text-center">
                  Our commitment to excellence drives everything we do, from our hiring practices to our delivery protocols.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center mb-4 mx-auto">
                  <Users className="text-medical-blue h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-center mb-3">Partnership</h3>
                <p className="text-gray-600 text-center">
                  We work closely with our clients to understand their needs and develop customized solutions that support their operations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-medical-blue mb-12 text-center">Our Leadership Team</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold">Dr. Maria Rodriguez</h3>
                <p className="text-medical-blue mb-2">Chief Executive Officer</p>
                <p className="text-gray-600 text-sm">Former Director of Laboratory Services with over 15 years of healthcare logistics experience.</p>
              </div>
              
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold">James Wilson</h3>
                <p className="text-medical-blue mb-2">Chief Operations Officer</p>
                <p className="text-gray-600 text-sm">Logistics specialist with experience managing transportation for major hospital systems.</p>
              </div>
              
              <div className="text-center">
                <div className="w-48 h-48 bg-gray-200 rounded-full mx-auto mb-4"></div>
                <h3 className="text-xl font-bold">Sarah Chen</h3>
                <p className="text-medical-blue mb-2">Director of Compliance</p>
                <p className="text-gray-600 text-sm">Healthcare regulatory specialist focused on maintaining the highest standards of compliance and safety.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-medical-teal text-white py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the ExpressMed Dispatch Team</h2>
              <p className="mb-6">
                We're always looking for dedicated professionals to join our team. Check out our current opportunities.
              </p>
              <Button asChild size="lg" variant="default" className="bg-white text-medical-teal hover:bg-gray-100">
                <Link to="/careers">View Career Opportunities</Link>
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
