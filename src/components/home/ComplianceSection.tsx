
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Check } from 'lucide-react';

const complianceFeatures = [
  "HIPAA-trained and certified couriers",
  "Secure specimen and document handling",
  "Complete chain of custody documentation",
  "Temperature-controlled transportation",
  "Biohazard handling protocols",
  "Specialized medical packaging",
  "Secure electronic delivery verification",
  "Comprehensive compliance reporting"
];

export const ComplianceSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-medical-blue/10 rounded-full px-4 py-1 text-medical-blue font-semibold text-sm mb-6">
              <Shield size={16} />
              <span>HIPAA Compliant Service</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-medical-blue mb-6">
              Setting the Standard for Medical Transport Compliance
            </h2>
            <p className="text-gray-600 mb-8">
              At ExpressMed Dispatch, compliance isn't just a feature—it's the foundation of everything we do. Our comprehensive approach ensures that all medical specimens, documents, and pharmaceuticals are handled according to strict regulatory standards.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mb-8">
              {complianceFeatures.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-medical-blue mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <Button asChild>
              <Link to="/compliance">Learn About Our Compliance</Link>
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-medical-blue/10 rounded-full"></div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-medical-teal/10 rounded-full"></div>
            
            <div className="relative bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="w-16 h-16 rounded-full bg-medical-blue flex items-center justify-center mb-6">
                <Shield size={32} className="text-white" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">HIPAA Compliant Medical Transport</h3>
              <p className="text-gray-600 mb-6">
                Our specialized training and secure handling protocols ensure that all medical materials are transported with the highest levels of privacy and security.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-2 rounded-full bg-medical-blue"></div>
                  <span className="text-sm font-medium">Courier Certification</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-2 rounded-full bg-medical-teal"></div>
                  <span className="text-sm font-medium">Secure Transport Protocols</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-2 rounded-full bg-medical-red"></div>
                  <span className="text-sm font-medium">Documentation Standards</span>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 italic">
                  "ExpressMed Dispatch's attention to compliance details gives us complete confidence in their handling of our sensitive materials."
                </p>
                <p className="text-sm font-medium mt-2">— San Antonio Medical Center Lab Director</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComplianceSection;
