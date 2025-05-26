
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Upload, FileText, User, Car, Shield } from 'lucide-react';
import { toast } from 'sonner';
import DocumentUpload from '@/components/driver/DocumentUpload';
import VehicleInformation from '@/components/driver/VehicleInformation';
import ProfileCompletion from '@/components/driver/ProfileCompletion';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  completed: boolean;
}

const DriverOnboarding = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'profile',
      title: 'Complete Profile',
      description: 'Add additional personal information',
      icon: <User className="h-5 w-5" />,
      completed: false
    },
    {
      id: 'vehicle',
      title: 'Vehicle Information',
      description: 'Add your vehicle details and registration',
      icon: <Car className="h-5 w-5" />,
      completed: false
    },
    {
      id: 'documents',
      title: 'Upload Documents',
      description: 'Upload license, insurance, and registration',
      icon: <FileText className="h-5 w-5" />,
      completed: false
    },
    {
      id: 'verification',
      title: 'Account Verification',
      description: 'Wait for admin approval',
      icon: <Shield className="h-5 w-5" />,
      completed: false
    }
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/driver-auth');
      return;
    }

    // Check if onboarding is already completed
    if (user.user_metadata?.onboarding_completed) {
      navigate('/driver-dashboard');
    }
  }, [user, navigate]);

  const markStepCompleted = (stepId: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, completed: true } : step
    ));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Update user metadata to mark onboarding as completed
      // This would typically be done through a Supabase function
      toast.success('Onboarding completed! Your account is pending verification.');
      navigate('/driver-dashboard');
    } catch (error) {
      toast.error('Failed to complete onboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipToReview = () => {
    setCurrentStep(steps.length - 1);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const completedSteps = steps.filter(step => step.completed).length;

  if (!user) {
    return null;
  }

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case 'profile':
        return (
          <ProfileCompletion 
            user={user}
            onComplete={() => markStepCompleted('profile')}
          />
        );
      case 'vehicle':
        return (
          <VehicleInformation 
            userId={user.id}
            onComplete={() => markStepCompleted('vehicle')}
          />
        );
      case 'documents':
        return (
          <DocumentUpload 
            userId={user.id}
            onComplete={() => markStepCompleted('documents')}
          />
        );
      case 'verification':
        return (
          <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Account Under Review</h3>
              <p className="text-gray-600 mb-4">
                Your documents are being reviewed by our team. This usually takes 1-2 business days.
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Our team will verify your documents</li>
                  <li>• You'll receive an email once approved</li>
                  <li>• You can start accepting deliveries immediately after approval</li>
                </ul>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CatNet Logistics</h1>
          <p className="text-gray-600">Let's get your driver account set up</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {completedSteps} of {steps.length} completed
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Steps Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-50'
                  : step.completed
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className={`${index === currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
                    {step.icon}
                  </div>
                )}
                <span className={`font-medium ${
                  index === currentStep ? 'text-blue-900' : 
                  step.completed ? 'text-green-900' : 'text-gray-700'
                }`}>
                  {step.title}
                </span>
              </div>
              <p className={`text-sm ${
                index === currentStep ? 'text-blue-700' : 
                step.completed ? 'text-green-700' : 'text-gray-500'
              }`}>
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {steps[currentStep].icon}
              {steps[currentStep].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            
            {currentStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                disabled={!steps[currentStep].completed}
              >
                Next Step
              </Button>
            )}
            
            {currentStep === steps.length - 1 && (
              <Button
                onClick={handleComplete}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                Complete Setup
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={handleSkipToReview}
              className="text-gray-500"
            >
              Skip to Review
            </Button>
            
            <Button
              variant="ghost"
              onClick={signOut}
              className="text-red-500 hover:text-red-700"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverOnboarding;
