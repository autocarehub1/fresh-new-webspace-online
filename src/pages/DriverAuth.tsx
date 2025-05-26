
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import DriverSignInForm from '@/components/auth/DriverSignInForm';
import DriverSignUpForm from '@/components/auth/DriverSignUpForm';
import DriverPasswordResetForm from '@/components/auth/DriverPasswordResetForm';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const DriverAuth = () => {
  const [activeTab, setActiveTab] = useState('signin');
  const navigate = useNavigate();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/49b6466e-7267-4a9d-a03c-5b25317f80a4.png" 
              alt="Catalyst Network Logistics" 
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-900">Driver Portal</h1>
            <p className="text-gray-600">Sign in or create your driver account</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Driver Authentication</CardTitle>
              <CardDescription>
                Access your driver dashboard and manage deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  <TabsTrigger value="reset">Reset</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <DriverSignInForm />
                </TabsContent>
                
                <TabsContent value="signup">
                  <DriverSignUpForm />
                </TabsContent>
                
                <TabsContent value="reset">
                  <DriverPasswordResetForm />
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <Button asChild variant="ghost" className="gap-2">
                  <Link to="/">
                    <ArrowLeft size={16} />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverAuth;
