
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        toast.error('You must be logged in to access this page');
        navigate('/login');
        return;
      }

      try {
        // Check if user is admin
        console.log('Checking admin role for user ID:', user.id);
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        console.log('Admin check result:', { data, error });

        if (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          toast.error('Error verifying your access level');
        } else if (data?.role !== 'admin') {
          console.log('User is not an admin:', data);
          setIsAdmin(false);
          toast.error('You do not have permission to access this page');
        } else {
          console.log('User is an admin');
          setIsAdmin(true);
        }
      } catch (err) {
        console.error('Unexpected error checking admin status:', err);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    };

    if (!isLoading) {
      checkAdminAccess();
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (isLoading || checkingAdmin) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow bg-gray-50">
          <div className="container mx-auto px-4 py-12 max-w-2xl">
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription>
                Your account does not have administrator privileges.
              </AlertDescription>
            </Alert>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <Shield className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Administrator Access Required</h2>
              <p className="text-gray-600 mb-6">
                This area is restricted to administrators only. If you believe you should have access, 
                please contact the system administrator.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => navigate('/')}>
                  Return to Home
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white border rounded-md p-4 mb-6 flex justify-between items-center">
            <div>
              <h2 className="font-medium">Welcome, {user.email}</h2>
              <p className="text-sm text-gray-600">
                Admin Dashboard
              </p>
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              Sign Out
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
