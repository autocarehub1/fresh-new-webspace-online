import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="bg-medical-blue py-16 px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="mt-4 text-xl">How we protect your information and maintain confidentiality</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="prose prose-blue mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-6 w-6 text-medical-blue" />
              <h2 className="text-2xl font-bold m-0">Our Commitment to Privacy</h2>
            </div>
            
            <p>
              At Catalyst Network Logistics, we take the privacy and security of your information seriously. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you use our website or services.
            </p>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <FileText className="h-6 w-6 text-medical-blue" />
              <h3 className="text-xl font-bold m-0">Information We Collect</h3>
            </div>
            
            <h4 className="text-lg font-medium mt-6 mb-2">Personal Information</h4>
            <p>
              We may collect personal information that you voluntarily provide when using our services, including but not limited to:
            </p>
            <ul>
              <li>Name, email address, phone number, and address</li>
              <li>Account login credentials</li>
              <li>Billing and payment information</li>
              <li>Pickup and delivery location information</li>
              <li>Service preferences and history</li>
            </ul>

            <h4 className="text-lg font-medium mt-6 mb-2">Medical Information</h4>
            <p>
              As a medical courier service, we may handle information related to medical specimens, pharmaceuticals, or other healthcare-related items. We follow HIPAA guidelines and implement strict security measures to protect any protected health information (PHI) that may be associated with the items we transport.
            </p>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <Eye className="h-6 w-6 text-medical-blue" />
              <h3 className="text-xl font-bold m-0">How We Use Your Information</h3>
            </div>
            
            <p>We may use the information we collect for various purposes, including:</p>
            <ul>
              <li>Providing, operating, and maintaining our services</li>
              <li>Processing and completing delivery requests</li>
              <li>Communicating with you about delivery status or account information</li>
              <li>Sending service updates and administrative messages</li>
              <li>Responding to your comments or inquiries</li>
              <li>Providing customer support</li>
              <li>Improving our website and services</li>
              <li>Complying with legal obligations</li>
            </ul>

            <div className="flex items-center gap-2 mt-8 mb-4">
              <Lock className="h-6 w-6 text-medical-blue" />
              <h3 className="text-xl font-bold m-0">How We Protect Your Information</h3>
            </div>
            
            <p>
              We implement appropriate security measures to protect your personal information, including:
            </p>
            <ul>
              <li>Encryption of sensitive data in transit and at rest</li>
              <li>Secure access controls and authentication protocols</li>
              <li>Regular security assessments and audits</li>
              <li>Employee training on data privacy and security</li>
              <li>Physical security measures for our facilities</li>
            </ul>

            <h4 className="text-lg font-medium mt-6 mb-2">HIPAA Compliance</h4>
            <p>
              We comply with the Health Insurance Portability and Accountability Act (HIPAA) and have implemented safeguards to protect any PHI that may be associated with the items we transport. Our staff receives regular HIPAA training, and we maintain Business Associate Agreements (BAAs) with healthcare partners as required.
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mt-8 mb-8">
              <h3 className="text-xl font-bold mb-4">Contact Us About Privacy</h3>
              <p>
                If you have any questions or concerns about our Privacy Policy or data practices, please contact us at:
              </p>
              <p className="font-medium">
                Email: <a href="mailto:catalystlogistics2025@gmail.com" className="text-medical-blue">catalystlogistics2025@gmail.com</a><br />
                Phone: <a href="tel:4322022150" className="text-medical-blue">(432)-202-2150</a>
              </p>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              This Privacy Policy was last updated on May 31, 2024.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 