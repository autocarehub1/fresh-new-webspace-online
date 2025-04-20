
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

const Admin = () => {
  const navigate = useNavigate();
  const { user, isLoading, signOut } = useAuth();
  
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!user) {
        toast.error('You must be logged in to access this page');
        navigate('/login');
        return;
      }

      // Check if user is admin
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error || data?.role !== 'admin') {
        toast.error('You do not have permission to access this page');
        navigate('/');
        return;
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
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
