import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import RequestPickupForm from '@/components/request/RequestPickupForm';

const RequestPickup = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-medical-lightGray py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-medical-blue">Request a Pickup</h1>
            <p className="text-gray-600 mb-8">
              Fill out the form below to request medical courier services. For emergency pickups, please call (432)-202-2150.
            </p>
            <RequestPickupForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RequestPickup;
