
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Demo credentials check - in a real app, this would use Supabase authentication
    setTimeout(() => {
      if (email === 'admin@example.com' && password === 'password123') {
        // Store a demo token in localStorage to simulate authentication
        localStorage.setItem('demoAuthToken', 'demo-auth-token');
        toast.success('Logged in successfully (Demo Mode)');
        navigate('/admin');
      } else {
        toast.error('Invalid credentials. For demo, use email: admin@example.com and password: password123');
      }
      setLoading(false);
    }, 800);
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
            <Alert className="mb-4 bg-amber-50 border-amber-200">
              <AlertDescription className="text-amber-800">
                <strong>Demo Mode:</strong> Use these credentials to log in:
                <ul className="list-disc pl-5 mt-2 text-sm">
                  <li>Email: admin@example.com</li>
                  <li>Password: password123</li>
                </ul>
                <p className="mt-2 text-sm">
                  For real authentication, connect your Lovable project to Supabase.
                </p>
              </AlertDescription>
            </Alert>
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-gray-500">
            <p>This is a demo. For real authentication, connect Supabase.</p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
