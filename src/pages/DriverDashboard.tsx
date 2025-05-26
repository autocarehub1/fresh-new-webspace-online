import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import DriverLocationTracker from '@/components/driver/DriverLocation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, MapPin, Package } from 'lucide-react';
import { toast } from 'sonner';
import ProofOfDeliveryPhotoForm from '@/components/driver/ProofOfDeliveryPhotoForm';
import { Input } from '@/components/ui/input';
import { Dialog } from '@/components/ui/dialog';

const TABS = [
  { key: 'profile', label: 'Profile' },
  { key: 'active', label: 'Active Delivery' },
  { key: 'history', label: 'History' },
  { key: 'earnings', label: 'Earnings' },
  { key: 'settings', label: 'Settings' },
];

const DriverDashboard = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const [currentDelivery, setCurrentDelivery] = useState<any>(null);
  const [driver, setDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPODForm, setShowPODForm] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const navigate = useNavigate();
  const [profileEdit, setProfileEdit] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [earnings, setEarnings] = useState<{ total: number; deliveries: any[] }>({ total: 0, deliveries: [] });
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [showStatementDialog, setShowStatementDialog] = useState(false);
  const [statementStart, setStatementStart] = useState('');
  const [statementEnd, setStatementEnd] = useState('');
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth check and load driver data
  useEffect(() => {
    const checkAuthAndLoadData = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          navigate('/driver-auth');
          return;
        }
        
        // Verify the driver ID matches the authenticated user
        if (session.user.id !== driverId) {
          navigate(`/driver/${session.user.id}`);
          return;
        }
        
        // Load driver data
        const { data: driverData, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('id', driverId)
          .single();
          
        if (driverError) throw driverError;
        
        if (!driverData) {
          navigate('/driver-profile-setup', {
            state: { userId: session.user.id }
          });
          return;
        }
        
        setDriver(driverData);
        setProfileData(driverData);
        
        // Load current delivery if any
        const { data: deliveryData, error: deliveryError } = await supabase
          .from('deliveries')
          .select('*')
          .eq('driver_id', driverId)
          .eq('status', 'in_progress')
          .single();
          
        if (deliveryError && deliveryError.code !== 'PGRST116') {
          console.error('Error loading delivery:', deliveryError);
        } else if (deliveryData) {
          setCurrentDelivery(deliveryData);
        }
        
      } catch (err: any) {
        console.error('Error loading driver data:', err);
        setError(err.message || 'Could not load driver information');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndLoadData();
  }, [driverId, navigate]);
  
  // Load delivery history
  useEffect(() => {
    const loadHistory = async () => {
      if (activeTab === 'history' && !history.length) {
        setHistoryLoading(true);
        try {
          const { data, error } = await supabase
            .from('deliveries')
            .select('*')
            .eq('driver_id', driverId)
            .order('created_at', { ascending: false })
            .limit(10);
            
          if (error) throw error;
          setHistory(data || []);
        } catch (err: any) {
          console.error('Error loading history:', err);
          toast.error('Failed to load delivery history');
        } finally {
          setHistoryLoading(false);
        }
      }
    };
    
    loadHistory();
  }, [activeTab, driverId, history.length]);
  
  // Load earnings
  useEffect(() => {
    const loadEarnings = async () => {
      if (activeTab === 'earnings' && !earnings.deliveries.length) {
        setEarningsLoading(true);
        try {
          const { data, error } = await supabase
            .from('deliveries')
            .select('*')
            .eq('driver_id', driverId)
            .eq('status', 'completed')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          const total = (data || []).reduce((sum, delivery) => sum + (delivery.amount || 0), 0);
          setEarnings({ total, deliveries: data || [] });
        } catch (err: any) {
          console.error('Error loading earnings:', err);
          toast.error('Failed to load earnings data');
        } finally {
          setEarningsLoading(false);
        }
      }
    };
    
    loadEarnings();
  }, [activeTab, driverId, earnings.deliveries.length]);
  
  // When driver loads, set profileData
  useEffect(() => {
    if (driver) {
      setProfileData({
        name: driver.name || '',
        phone: driver.phone || '',
        vehicle_type: driver.vehicle_type || '',
        photo: driver.photo || '',
      });
      setProfilePhotoPreview(driver.photo || null);
    }
  }, [driver]);
  
  // When driver loads, set availability
  useEffect(() => {
    if (driver && typeof driver.available === 'boolean') {
      setAvailability(driver.available);
    }
  }, [driver]);
  
  const updateDeliveryStatus = async (status: string) => {
    if (!currentDelivery) return;
    
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status,
          ...(status === 'completed' ? {
            completed_at: new Date().toISOString()
          } : {})
        })
        .eq('id', currentDelivery.id);
        
      if (error) {
        console.error('Error updating delivery status:', error);
        toast.error(`Failed to update status: ${error.message}`);
        return;
      }
      
      toast.success(`Delivery marked as ${status}`);
      
      // Add tracking update
      await supabase
        .from('tracking_updates')
        .insert({
          delivery_id: currentDelivery.id,
          status: status === 'in_progress' ? 'Driver En Route' : status.charAt(0).toUpperCase() + status.slice(1),
          timestamp: new Date().toISOString(),
          location: status === 'completed' ? currentDelivery.delivery_location : currentDelivery.pickup_location,
          note: status === 'completed' 
            ? 'Package has been delivered successfully' 
            : `Delivery status updated to ${status}`
        });
        
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update delivery status');
    }
  };
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData((prev: any) => ({ ...prev, [name]: value }));
  };
  
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
      setProfilePhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };
  
  const handleProfileSave = async () => {
    setProfileLoading(true);
    try {
      let photoUrl = profileData.photo;
      if (profilePhoto) {
        const fileExt = profilePhoto.name.split('.').pop();
        const fileName = `driver_${driver.id}_${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('driver-photos')
          .upload(fileName, profilePhoto, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from('driver-photos')
          .getPublicUrl(fileName);
        photoUrl = publicUrlData?.publicUrl || '';
      }
      const { error: updateError } = await supabase
        .from('drivers')
        .update({
          name: profileData.name,
          phone: profileData.phone,
          vehicle_type: profileData.vehicle_type,
          photo: photoUrl,
        })
        .eq('id', driver.id);
      if (updateError) throw updateError;
      toast.success('Profile updated!');
      setProfileEdit(false);
      setProfilePhoto(null);
      setProfilePhotoPreview(photoUrl);
      // Optionally, refetch driver data
      setDriver((prev: any) => ({ ...prev, ...profileData, photo: photoUrl }));
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };
  
  const handleToggleAvailability = async () => {
    if (!driver) return;
    setAvailabilityLoading(true);
    try {
      const newAvailability = !availability;
      const { error } = await supabase
        .from('drivers')
        .update({ available: newAvailability })
        .eq('id', driver.id);
      if (error) throw error;
      setAvailability(newAvailability);
      setDriver((prev: any) => ({ ...prev, available: newAvailability }));
      toast.success(`You are now marked as ${newAvailability ? 'available' : 'unavailable'} for new jobs.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update availability.');
    } finally {
      setAvailabilityLoading(false);
    }
  };
  
  function deliveriesToCSV(deliveries: any[]) {
    const header = ['Date', 'Package', 'From', 'To', 'Amount', 'Status'];
    const rows = deliveries.map(d => [
      d.completed_at ? new Date(d.completed_at).toLocaleDateString() : '',
      d.package_type,
      d.pickup_location,
      d.delivery_location,
      d.estimatedCost ? d.estimatedCost.toFixed(2) : '0.00',
      d.status.charAt(0).toUpperCase() + d.status.slice(1)
    ]);
    return [header, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
  }

  const handleDownloadStatement = () => {
    let filtered = earnings.deliveries;
    if (statementStart) {
      filtered = filtered.filter(d => d.completed_at && new Date(d.completed_at) >= new Date(statementStart));
    }
    if (statementEnd) {
      filtered = filtered.filter(d => d.completed_at && new Date(d.completed_at) <= new Date(statementEnd));
    }
    const csv = deliveriesToCSV(filtered);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `earnings_statement_${statementStart || 'all'}_${statementEnd || 'all'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowStatementDialog(false);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-medical-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading driver information...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  if (!driver) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Profile Setup Required</h2>
          <p className="text-gray-600 mb-4">Please complete your driver profile to access the dashboard.</p>
          <Button onClick={() => navigate('/driver-profile-setup')}>Complete Profile</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Driver Dashboard</h1>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 border-b">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`px-4 py-2 font-medium border-b-2 transition-colors duration-150 ${activeTab === tab.key ? 'border-medical-blue text-medical-blue' : 'border-transparent text-gray-500 hover:text-medical-blue'}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Tab Content */}
          <div>
            {activeTab === 'profile' && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                  {profileData && !profileEdit ? (
                    <div className="flex flex-col items-center gap-4">
                      <img
                        src={profilePhotoPreview || '/avatar-placeholder.png'}
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border"
                      />
                      <div className="text-lg font-semibold">{profileData.name}</div>
                      <div className="text-gray-600">{driver.email}</div>
                      <div className="text-gray-600">{profileData.phone}</div>
                      <div className="text-gray-600">{profileData.vehicle_type}</div>
                      {typeof availability === 'boolean' && (
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-sm font-medium ${availability ? 'text-green-600' : 'text-gray-400'}`}>{availability ? 'Available for jobs' : 'Unavailable'}</span>
                          <Button
                            size="sm"
                            variant={availability ? 'outline' : 'default'}
                            onClick={handleToggleAvailability}
                            disabled={availabilityLoading}
                          >
                            {availabilityLoading ? 'Updating...' : availability ? 'Go Unavailable' : 'Go Available'}
                          </Button>
                        </div>
                      )}
                      <Button className="mt-2" onClick={() => setProfileEdit(true)}>
                        Edit Profile
                      </Button>
                    </div>
                  ) : profileData && profileEdit ? (
                    <form className="space-y-4 max-w-sm mx-auto" onSubmit={e => { e.preventDefault(); handleProfileSave(); }}>
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={profilePhotoPreview || '/avatar-placeholder.png'}
                          alt="Profile Preview"
                          className="w-24 h-24 rounded-full object-cover border"
                        />
                        <Input type="file" accept="image/*" onChange={handleProfilePhotoChange} disabled={profileLoading} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <Input
                          type="text"
                          name="name"
                          value={profileData.name}
                          onChange={handleProfileChange}
                          required
                          disabled={profileLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Phone</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={profileData.phone}
                          onChange={handleProfileChange}
                          required
                          disabled={profileLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                        <select
                          name="vehicle_type"
                          className="w-full border rounded px-3 py-2"
                          value={profileData.vehicle_type}
                          onChange={handleProfileChange}
                          required
                          disabled={profileLoading}
                        >
                          <option value="">Select vehicle type</option>
                          {['Car', 'SUV', 'Van', 'Pickup Truck', 'Box Truck', 'Motorcycle', 'Bicycle', 'Other'].map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button type="submit" className="flex-1" disabled={profileLoading}>
                          {profileLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setProfileEdit(false)} disabled={profileLoading}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center text-gray-500">Loading profile...</div>
                  )}
                </CardContent>
              </Card>
            )}
            {activeTab === 'active' && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Active Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                  ) : currentDelivery ? (
                    <div className="space-y-6">
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-md space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Status:</span>
                          <span className="font-medium">
                            {currentDelivery.status.charAt(0).toUpperCase() + currentDelivery.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Pick-up:</span>
                          <span>{currentDelivery.pickup_location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Delivery:</span>
                          <span>{currentDelivery.delivery_location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Package:</span>
                          <span>{currentDelivery.package_type}</span>
                        </div>
                        {/* Optionally, show customer contact if available */}
                        {currentDelivery.contact_name && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Customer:</span>
                            <span>{currentDelivery.contact_name} {currentDelivery.contact_phone && (<span className="text-xs text-gray-400 ml-2">{currentDelivery.contact_phone}</span>)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <DriverLocationTracker 
                          driverId={driverId} 
                          deliveryId={currentDelivery.id} 
                        />
                      </div>
                      <div className="flex justify-between gap-4 pt-2">
                        {currentDelivery.status === 'pending' && (
                          <Button 
                            onClick={() => updateDeliveryStatus('in_progress')}
                            className="flex-1"
                          >
                            Start Delivery
                          </Button>
                        )}
                        {currentDelivery.status === 'in_progress' && !showPODForm && (
                          <Button 
                            onClick={() => setShowPODForm(true)}
                            className="flex-1"
                            variant="default"
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Delivered
                          </Button>
                        )}
                        {currentDelivery.status === 'in_progress' && showPODForm && (
                          <ProofOfDeliveryPhotoForm 
                            deliveryId={currentDelivery.id} 
                            onComplete={() => setShowPODForm(false)}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                      <Package className="h-12 w-12 text-gray-300 mb-4" />
                      <p>No active delivery assigned</p>
                      <p className="text-sm text-gray-400 mt-1">
                        New deliveries will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {activeTab === 'history' && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                  {historyLoading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                  ) : history.length === 0 ? (
                    <div className="text-center text-gray-500">No completed deliveries yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((item) => (
                        <div key={item.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center gap-4 bg-gray-50">
                          <div className="flex-1">
                            <div className="flex flex-wrap gap-2 items-center mb-1">
                              <span className="font-semibold text-medical-blue">{item.package_type}</span>
                              <span className="text-xs text-gray-400">{item.completed_at ? new Date(item.completed_at).toLocaleString() : ''}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">From:</span> {item.pickup_location}
                            </div>
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">To:</span> {item.delivery_location}
                            </div>
                          </div>
                          {item.proofOfDeliveryPhoto && (
                            <img
                              src={item.proofOfDeliveryPhoto}
                              alt="Proof of Delivery"
                              className="w-20 h-20 object-cover rounded border shadow"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            {activeTab === 'earnings' && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-end mb-4">
                    <Button size="sm" variant="outline" onClick={() => setShowStatementDialog(true)}>
                      Download Statement
                    </Button>
                  </div>
                  {earningsLoading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                  ) : (
                    <>
                      <div className="mb-6 text-center">
                        <div className="text-2xl font-bold text-medical-blue">${earnings.total.toFixed(2)}</div>
                        <div className="text-gray-500 text-sm">Total Earnings</div>
                      </div>
                      {earnings.deliveries.length === 0 ? (
                        <div className="text-center text-gray-500">No completed deliveries yet.</div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm border rounded">
                            <thead>
                              <tr className="bg-gray-100">
                                <th className="px-3 py-2 text-left">Date</th>
                                <th className="px-3 py-2 text-left">Package</th>
                                <th className="px-3 py-2 text-left">Amount</th>
                                <th className="px-3 py-2 text-left">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {earnings.deliveries.map((item) => (
                                <tr key={item.id} className="border-b">
                                  <td className="px-3 py-2">{item.completed_at ? new Date(item.completed_at).toLocaleDateString() : ''}</td>
                                  <td className="px-3 py-2">{item.package_type}</td>
                                  <td className="px-3 py-2">${item.estimatedCost ? item.estimatedCost.toFixed(2) : '0.00'}</td>
                                  <td className="px-3 py-2">{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )}
                  {/* Statement Download Dialog */}
                  <Dialog open={showStatementDialog} onOpenChange={setShowStatementDialog}>
                    <div className="bg-white p-6 rounded shadow max-w-sm mx-auto">
                      <h2 className="text-lg font-bold mb-2">Download Earnings Statement</h2>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <Input type="date" value={statementStart} onChange={e => setStatementStart(e.target.value)} />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <Input type="date" value={statementEnd} onChange={e => setStatementEnd(e.target.value)} />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button onClick={handleDownloadStatement} className="flex-1">Download CSV</Button>
                        <Button variant="outline" onClick={() => setShowStatementDialog(false)} className="flex-1">Cancel</Button>
                      </div>
                    </div>
                  </Dialog>
                </CardContent>
              </Card>
            )}
            {activeTab === 'settings' && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500">Settings section coming soon...</div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DriverDashboard; 