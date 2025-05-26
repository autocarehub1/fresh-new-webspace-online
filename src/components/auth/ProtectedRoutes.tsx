import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
      <h2 className="text-lg font-semibold text-gray-700">Loading...</h2>
      <p className="text-gray-500">Checking authentication...</p>
    </div>
  </div>
);

// Protected route component
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Get auth context from hook
  const auth = useAuth();
  
  // Extract user and loading state
  const { user, isLoading } = auth;
  
  // Log for debugging
  console.log('ProtectedRoute:', { user, isLoading });
  
  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Redirect to login if no user is authenticated
  if (!user) {
    console.log('No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

// Customer route protection
export const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  // Get auth context from hook
  const auth = useAuth();
  
  // Extract user and loading state
  const { user, isLoading } = auth;
  
  // Log for debugging
  console.log('CustomerRoute:', { user, isLoading });
  
  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Redirect to customer login if no user is authenticated
  if (!user) {
    console.log('No user, redirecting to customer login');
    return <Navigate to="/customer-login" replace />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
}; 