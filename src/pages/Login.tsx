
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const navigate = useNavigate();

  // Check if Supabase is properly configured
  useEffect(() => {
    const checkSupabaseConfig = async () => {
      try {
        // Test if Supabase is properly configured
        const { error } = await supabase.auth.getSession();
        
        if (error && error.message === 'Supabase not configured') {
          setConfigError(true);
        }
      } catch (error) {
        console.error('Error checking Supabase configuration:', error);
        setConfigError(true);
      }
    };
    
    checkSupabaseConfig();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (configError) {
      toast.error('Supabase configuration is missing. Cannot log in.');
      return;
    }
    
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      toast.success('Logged in successfully');
      navigate('/admin');
    } catch (error: any) {
      toast.error(error.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            {configError && (
              <Alert className="mb-4 bg-amber-50 border-amber-200">
                <AlertDescription className="text-amber-800">
                  Missing Supabase configuration. Make sure to set up your Supabase environment variables:
                  <ul className="list-disc pl-5 mt-2 text-sm">
                    <li>VITE_SUPABASE_URL</li>
                    <li>VITE_SUPABASE_ANON_KEY</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="admin@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={configError}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={configError}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || configError}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            {configError ? 
              <p>Please set up Supabase environment variables to enable login</p> :
              <p>Contact your administrator if you need access</p>
            }
          </CardFooter>
        </Card>
      </main>
    </div>
  );
};

export default Login;
