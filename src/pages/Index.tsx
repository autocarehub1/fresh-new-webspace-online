
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import Features from '@/components/home/Features';
import CtaBanner from '@/components/home/CtaBanner';
import ComplianceSection from '@/components/home/ComplianceSection';
import Testimonials from '@/components/home/Testimonials';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Services />
        <Features />
        <CtaBanner />
        <ComplianceSection />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
