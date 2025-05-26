import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FileText, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="bg-medical-blue py-16 px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="mt-4 text-xl">The agreement between you and Catalyst Network Logistics</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="prose prose-blue mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <FileText className="h-6 w-6 text-medical-blue" />
              <h2 className="text-2xl font-bold m-0">Agreement to Terms</h2>
            </div>
            
            <p>
              These Terms of Service ("Terms") govern your use of Catalyst Network Logistics' website, services, and mobile applications (collectively, the "Services"). By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Services.
            </p>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <CheckCircle className="h-6 w-6 text-medical-blue" />
              <h3 className="text-xl font-bold m-0">Services Description</h3>
            </div>
            
            <p>
              Catalyst Network Logistics provides medical courier services, including but not limited to:
            </p>
            
            <ul>
              <li>Medical specimen transportation</li>
              <li>Laboratory deliveries</li>
              <li>Pharmaceutical deliveries</li>
              <li>Medical equipment transportation</li>
              <li>Same-day and scheduled medical delivery services</li>
              <li>Temperature-controlled transportation</li>
            </ul>
            
            <h4 className="text-lg font-medium mt-6 mb-2">Service Availability</h4>
            <p>
              Our Services are primarily available in San Antonio, Texas, and surrounding areas. Service availability may vary based on location, time, and other factors. We reserve the right to refuse service to anyone for any reason at any time.
            </p>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <AlertCircle className="h-6 w-6 text-medical-blue" />
              <h3 className="text-xl font-bold m-0">User Responsibilities</h3>
            </div>
            
            <p>When using our Services, you agree to:</p>
            
            <ul>
              <li>Provide accurate and complete information for delivery requests</li>
              <li>Ensure items for transport comply with all applicable laws and regulations</li>
              <li>Properly package and label all items for transport</li>
              <li>Obtain any necessary permits or authorizations for regulated items</li>
              <li>Pay all fees and charges associated with your use of our Services</li>
              <li>Use our Services in compliance with these Terms and all applicable laws</li>
            </ul>

            <h4 className="text-lg font-medium mt-6 mb-2">Prohibited Items</h4>
            <p>
              You may not use our Services to transport:
            </p>
            <ul>
              <li>Illegal substances or items</li>
              <li>Hazardous materials not properly disclosed and packaged</li>
              <li>Any items prohibited by federal, state, or local law</li>
            </ul>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <HelpCircle className="h-6 w-6 text-medical-blue" />
              <h3 className="text-xl font-bold m-0">Limitation of Liability</h3>
            </div>
            
            <p>
              To the maximum extent permitted by law, Catalyst Network Logistics shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, resulting from your use of the Services.
            </p>
            
            <p>
              Our liability for any claim arising from or related to the Services shall not exceed the amount you paid to us for the specific delivery in question.
            </p>

            <h4 className="text-lg font-medium mt-6 mb-2">Force Majeure</h4>
            <p>
              We shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to acts of God, natural disasters, pandemics, civil unrest, or governmental actions.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mt-8 mb-8">
              <h3 className="text-xl font-bold mb-4">Modifications to Terms</h3>
              <p>
                We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website. Your continued use of our Services after such changes constitutes your acceptance of the new Terms.
              </p>
            </div>

            <h4 className="text-lg font-medium mt-6 mb-2">Governing Law</h4>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the State of Texas, without regard to its conflict of law provisions.
            </p>

            <p className="text-sm text-gray-500 mt-8">
              These Terms of Service were last updated on May 31, 2024.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 