
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RequestPickupForm from '@/components/request/RequestPickupForm';

const RequestPickup = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-medical-blue mb-4">Request a Pickup</h1>
              <p className="text-gray-600">
                Fill out the form below to schedule your delivery service. We'll contact you to confirm the details.
              </p>
            </div>

            <RequestPickupForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestPickup;
