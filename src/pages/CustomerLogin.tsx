
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success('Account created successfully! Please check your email for verification.');
      } else {
        await signIn(email, password);
        toast.success('Logged in successfully');
        navigate('/customer-portal');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || `Failed to ${isSignUp ? 'create account' : 'log in'}`);
      toast.error(`${isSignUp ? 'Sign up' : 'Login'} failed`);
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
            <p className="text-gray-600">
              {isSignUp ? 'Create your account to manage deliveries' : 'Sign in to track and manage your deliveries'}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isSignUp ? 'Create Account' : 'Welcome Back'}</CardTitle>
              <CardDescription>
                {isSignUp 
                  ? 'Enter your details to create a customer account'
                  : 'Enter your credentials to access your customer portal'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading 
                    ? (isSignUp ? 'Creating Account...' : 'Signing in...') 
                    : (isSignUp ? 'Create Account' : 'Sign In')
                  }
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="gap-2"
                >
                  <UserPlus size={16} />
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </Button>
              </div>

              <div className="mt-4 text-center">
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

export default CustomerLogin;
