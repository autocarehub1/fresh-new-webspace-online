
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

const vehicleTypes = [
  'Car', 'SUV', 'Van', 'Pickup Truck', 'Box Truck', 'Motorcycle', 'Bicycle', 'Other'
];

const DriverProfileSetup = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700">Loading...</h2>
          <p className="text-gray-500">Initializing profile setup...</p>
        </div>
      </div>
    );
  }

  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    vehicle_type: '',
    photo: null as File | null,
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Get userId from location state or current user
  const userId = location.state?.userId || user?.id;
  
  useEffect(() => {
    // Redirect if no user
    if (!userId) {
      toast.error("Authentication required");
      navigate('/driver-auth');
      return;
    }
    
    // Pre-fill name if available from user metadata
    const firstName = user?.user_metadata?.first_name || '';
    const lastName = user?.user_metadata?.last_name || '';
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
    
    if (fullName) {
      setProfileData(prev => ({ ...prev, name: fullName }));
    } else if (firstName || lastName) {
      setProfileData(prev => ({ ...prev, name: `${firstName} ${lastName}`.trim() }));
    }
    
    // Pre-fill phone if available
    const phone = user?.user_metadata?.phone || '';
    if (phone) {
      setProfileData(prev => ({ ...prev, phone }));
    }
    
    // Check if user already has a profile
    const checkProfile = async () => {
      try {
        console.log('Checking for existing profile for user:', userId);
        
        // First check drivers table
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
          
        if (driverData && !driverError) {
          console.log('Driver profile exists, redirecting to dashboard');
          toast.info("Your profile is already set up");
          navigate(`/driver/${userId}`);
          return;
        }
        
        // Then check driver_profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
          
        if (profileData && !profileError) {
          console.log('Driver profile exists in driver_profiles, redirecting to dashboard');
          toast.info("Your profile is already set up");
          navigate(`/driver/${userId}`);
          return;
        }
        
        console.log('No existing profile found, continuing with setup');
      } catch (err) {
        console.log('No profile exists, that\'s expected for new users');
      }
    };
    
    checkProfile();
  }, [userId, user, navigate]);
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profileData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!profileData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(profileData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!profileData.vehicle_type) {
      errors.vehicle_type = 'Please select a vehicle type';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    console.log('Starting profile setup for user:', userId);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      if (!user?.email) {
        throw new Error("User email is required");
      }
      
      // 1. Upload photo if provided
      let photoUrl = '';
      if (profileData.photo) {
        console.log('Uploading photo...');
        const fileExt = profileData.photo.name.split('.').pop();
        const fileName = `driver_${userId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('driver-photos')
          .upload(fileName, profileData.photo, { upsert: true });
          
        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          throw new Error(`Failed to upload photo: ${uploadError.message}`);
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('driver-photos')
          .getPublicUrl(fileName);
          
        photoUrl = publicUrlData?.publicUrl || '';
        console.log('Photo uploaded successfully:', photoUrl);
      }
      
      // 2. Create driver profile in drivers table
      console.log('Creating driver profile...');
      const { error: profileError } = await supabase
        .from('drivers')
        .insert({
          id: userId,
          name: profileData.name.trim(),
          email: user.email,
          phone: profileData.phone.trim(),
          vehicle_type: profileData.vehicle_type,
          photo: photoUrl,
          status: 'active',
        });
        
      if (profileError) {
        console.error('Driver profile creation error:', profileError);
        throw new Error(`Failed to create driver profile: ${profileError.message || 'Database error'}`);
      }
      
      // 3. Also create entry in driver_profiles table for compatibility
      console.log('Creating driver_profiles entry...');
      const { error: driverProfileError } = await supabase
        .from('driver_profiles')
        .insert({
          user_id: userId,
          email: user.email,
          full_name: profileData.name.trim(),
          phone: profileData.phone.trim(),
          vehicle_type: profileData.vehicle_type,
          preferences: {
            notifications: true,
            location_sharing: true,
            auto_accept_deliveries: false
          },
          documents: {}
        });
        
      if (driverProfileError) {
        console.warn('Driver profiles creation warning:', driverProfileError);
        // Don't fail if this table doesn't exist or has issues
      }
      
      // 4. Update user metadata
      console.log('Updating user metadata...');
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name.trim(),
          phone: profileData.phone.trim(),
          vehicle_type: profileData.vehicle_type,
          has_completed_profile: true,
          onboarding_completed: true
        }
      });
      
      if (updateError) {
        console.error('User metadata update error:', updateError);
        // Don't fail the whole process for metadata update issues
        console.warn('Continuing despite metadata update error');
      }
      
      console.log('Profile setup completed successfully');
      toast.success("Profile setup complete!");
      navigate(`/driver/${userId}`);
      
    } catch (err: any) {
      console.error('Profile setup error:', err);
      const errorMessage = err?.message || err?.error?.message || 'Failed to set up profile - please try again';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Driver Profile</CardTitle>
          <CardDescription>
            Please provide the following information to start accepting deliveries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm flex items-center">
              <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">Full Name</label>
              <Input
                id="name"
                value={profileData.name}
                onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                required
                disabled={loading}
                className={validationErrors.name ? 'border-red-500' : ''}
                placeholder="Enter your full name"
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">Phone Number</label>
              <Input
                id="phone"
                type="tel"
                value={profileData.phone}
                onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                required
                disabled={loading}
                className={validationErrors.phone ? 'border-red-500' : ''}
                placeholder="+1 (555) 555-5555"
              />
              {validationErrors.phone && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="vehicle">Vehicle Type</label>
              <select
                id="vehicle"
                className={`w-full border rounded px-3 py-2 ${validationErrors.vehicle_type ? 'border-red-500' : 'border-gray-300'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={profileData.vehicle_type}
                onChange={e => setProfileData({ ...profileData, vehicle_type: e.target.value })}
                required
                disabled={loading}
              >
                <option value="">Select your vehicle type</option>
                {vehicleTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              {validationErrors.vehicle_type && (
                <p className="mt-1 text-sm text-red-500">{validationErrors.vehicle_type}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="photo">Profile Photo (Optional)</label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={e => {
                  if (e.target.files && e.target.files[0]) {
                    setProfileData({ ...profileData, photo: e.target.files[0] });
                    setPhotoPreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                disabled={loading}
              />
              {photoPreview && (
                <div className="mt-2 flex justify-center">
                  <img src={photoPreview} alt="Profile Preview" className="w-24 h-24 object-cover rounded-full border" />
                </div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Setting Up...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverProfileSetup;
