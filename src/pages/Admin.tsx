
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const Admin = () => {
  const navigate = useNavigate();

  // Check if user is authenticated and has admin role
  const { data: session, isLoading, isError } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
      } catch (error) {
        console.error('Error fetching session:', error);
        toast.error('Authentication error. Please contact support.');
        return null;
      }
    },
  });

  useEffect(() => {
    if (!isLoading && !session) {
      toast.error('You must be logged in to access this page');
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isError) {
    return <div className="flex items-center justify-center min-h-screen">Error connecting to authentication service</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <AdminDashboard />
      </main>
    </div>
  );
};

export default Admin;
