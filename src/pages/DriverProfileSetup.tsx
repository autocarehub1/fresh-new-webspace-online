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
    
    // Pre-fill name if available from OAuth
    if (user?.user_metadata?.full_name) {
      setProfileData(prev => ({
        ...prev,
        name: user.user_metadata.full_name
      }));
    }
    
    if (user?.user_metadata?.name) {
      setProfileData(prev => ({
        ...prev,
        name: user.user_metadata.name
      }));
    }
    
    // Check if user already has a profile
    const checkProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (data) {
          // Profile exists, redirect to dashboard
          toast.info("Your profile is already set up");
          navigate(`/driver/${userId}`);
        }
      } catch (err) {
        // No profile exists, that's expected
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
    } else if (!/^\+?[\d\s-]{10,}$/.test(profileData.phone)) {
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
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }
      
      // 1. Upload photo if provided
      let photoUrl = '';
      if (profileData.photo) {
        const fileExt = profileData.photo.name.split('.').pop();
        const fileName = `driver_${userId}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('driver-photos')
          .upload(fileName, profileData.photo, { upsert: true });
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('driver-photos')
          .getPublicUrl(fileName);
          
        photoUrl = publicUrlData?.publicUrl || '';
      }
      
      // 2. Create driver profile
      const { error: profileError } = await supabase
        .from('drivers')
        .insert({
          id: userId,
          name: profileData.name,
          email: user?.email || '',
          phone: profileData.phone,
          vehicle_type: profileData.vehicle_type,
          photo: photoUrl,
          status: 'active',
        });
        
      if (profileError) throw profileError;
      
      // 3. Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: profileData.name,
          phone: profileData.phone,
          vehicle_type: profileData.vehicle_type,
          has_completed_profile: true
        }
      });
      
      if (updateError) throw updateError;
      
      toast.success("Profile setup complete!");
      navigate(`/driver/${userId}`);
    } catch (err: any) {
      console.error('Profile setup error:', err);
      setError(err.message || 'Failed to set up profile');
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
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
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
                className={`w-full border rounded px-3 py-2 ${validationErrors.vehicle_type ? 'border-red-500' : ''}`}
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
              <label className="block text-sm font-medium mb-1" htmlFor="photo">Profile Photo</label>
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
                'Complete Setup'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverProfileSetup; 