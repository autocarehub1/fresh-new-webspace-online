import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, FileText, Award, BadgeCheck } from "lucide-react";

export default function Compliance() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-blue-900 py-16 px-4 sm:px-6 lg:px-8 text-white">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">Medical Transport Compliance</h1>
          <p className="mt-4 text-xl">Ensuring safety, privacy, and regulatory standards in every delivery</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="hipaa" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hipaa">HIPAA Compliance</TabsTrigger>
            <TabsTrigger value="regulations">Transport Regulations</TabsTrigger>
            <TabsTrigger value="safety">Safety Standards</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>
          
          <div className="mt-8">
            <TabsContent value="hipaa">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                    <CardTitle>HIPAA Compliance</CardTitle>
                  </div>
                  <CardDescription>
                    How we protect sensitive medical information during transport
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our medical delivery service maintains strict HIPAA compliance to ensure the privacy and security of all protected health information (PHI).
                  </p>
                  
                  <h3 className="text-lg font-medium">Our HIPAA Compliance Measures:</h3>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Comprehensive driver training on HIPAA requirements and PHI handling</li>
                    <li>Secure, sealed packaging for all medical materials</li>
                    <li>Digital tracking systems with role-based access controls</li>
                    <li>Encrypted communications for all delivery information</li>
                    <li>Regular security audits and compliance assessments</li>
                    <li>Business Associate Agreements (BAAs) with all healthcare partners</li>
                  </ul>
                  
                  <Separator />
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800">Privacy Guarantee</h4>
                    <p className="text-blue-700 mt-1">
                      We never share patient information with unauthorized parties and maintain strict chain-of-custody protocols for all medical deliveries.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="regulations">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <CardTitle>Transport Regulations</CardTitle>
                  </div>
                  <CardDescription>
                    Regulatory compliance for medical material transportation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    We adhere to all federal, state, and local regulations governing the transportation of medical materials, specimens, and pharmaceuticals.
                  </p>
                  
                  <h3 className="text-lg font-medium">Regulatory Framework:</h3>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Department of Transportation (DOT) regulations for medical material transport</li>
                    <li>FDA requirements for pharmaceutical delivery</li>
                    <li>CDC guidelines for biological specimen handling</li>
                    <li>State pharmacy board regulations for medication transport</li>
                    <li>OSHA requirements for handler safety</li>
                  </ul>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium">Temperature Control</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Our vehicles are equipped with temperature monitoring and control systems for temperature-sensitive materials.
                      </p>
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium">Hazardous Materials</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        All drivers are certified for safe handling of regulated medical waste and hazardous materials.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="safety">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <BadgeCheck className="h-6 w-6 text-blue-600" />
                    <CardTitle>Safety Standards</CardTitle>
                  </div>
                  <CardDescription>
                    Ensuring safe handling and transport of medical materials
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our comprehensive safety protocols exceed industry standards to protect both our team members and the integrity of transported medical materials.
                  </p>
                  
                  <h3 className="text-lg font-medium">Safety Protocols:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium text-center">Driver Safety</h4>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>Comprehensive background checks</li>
                        <li>Defensive driving training</li>
                        <li>Regular vehicle inspections</li>
                        <li>Real-time GPS tracking</li>
                      </ul>
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium text-center">Package Safety</h4>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>UN-certified packaging materials</li>
                        <li>Specialized containers for specimens</li>
                        <li>Tamper-evident seals</li>
                        <li>Spill containment protocols</li>
                      </ul>
                    </div>
                    
                    <div className="border p-4 rounded-lg">
                      <h4 className="font-medium text-center">Emergency Protocols</h4>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>24/7 dispatch support</li>
                        <li>Incident response training</li>
                        <li>Backup vehicle availability</li>
                        <li>Contingency routing</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg mt-4">
                    <h4 className="font-medium text-green-800">Safety Record</h4>
                    <p className="text-green-700 mt-1">
                      We maintain a 99.8% incident-free delivery record, with continuous improvement through our safety review process.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="certifications">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Award className="h-6 w-6 text-blue-600" />
                    <CardTitle>Certifications & Training</CardTitle>
                  </div>
                  <CardDescription>
                    Professional standards and ongoing education
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>
                    Our team maintains the highest level of professional certifications and participates in ongoing training to ensure compliance with evolving regulations.
                  </p>
                  
                  <h3 className="text-lg font-medium">Team Certifications:</h3>
                  
                  <ul className="list-disc pl-5 space-y-2">
                    <li>HIPAA Compliance Certification</li>
                    <li>Bloodborne Pathogens Training</li>
                    <li>Hazardous Materials Handling (HazMat)</li>
                    <li>Specimen Handling Certification</li>
                    <li>Cold Chain Management Training</li>
                    <li>Pharmaceutical Transport Certification</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium mt-4">Organizational Accreditations:</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {['ISO 9001', 'NABP Accreditation', 'HIPAA Compliance', 'DOT Certification'].map((cert) => (
                      <div key={cert} className="flex flex-col items-center p-4 border rounded-lg bg-gray-50">
                        <BadgeCheck className="h-10 w-10 text-blue-600 mb-2" />
                        <span className="text-sm font-medium text-center">{cert}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6">
                    <Button variant="outline" className="mr-4">Download Certification Guide</Button>
                    <Button>Request Compliance Documentation</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
} 