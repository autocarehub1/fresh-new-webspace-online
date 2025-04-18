
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for demo authentication token
    const checkAuth = () => {
      const token = localStorage.getItem('demoAuthToken');
      if (!token) {
        toast.error('You must be logged in to access this page');
        navigate('/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <h2 className="text-amber-800 font-medium">Demo Mode Active</h2>
            <p className="text-amber-700 text-sm">
              This is a demo of the admin interface. In a real application, this would be secured with Supabase authentication.
            </p>
            <Button 
              className="mt-2 text-xs"
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('demoAuthToken');
                toast.success('Logged out successfully');
                navigate('/login');
              }}
            >
              Demo Logout
            </Button>
          </div>
          <AdminDashboard />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
