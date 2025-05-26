import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Map from '@/components/map/Map';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const projectId = 'joziqntfciyflfsgvsqz'; // Supabase project ID
      const baseUrl = `https://${projectId}.supabase.co`;

      const response = await fetch(`${baseUrl}/functions/v1/send-contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Server response:', data);
        throw new Error(data.error || 'Failed to send message');
      }

      toast.success('Message sent successfully! We will contact you shortly.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-medical-blue py-16 md:py-20 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
              <p className="text-xl">
                Have questions or need assistance? Our team is ready to help you with all your medical courier needs.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Information and Form */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-medical-blue mb-8">Get in Touch</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-medical-blue/10 rounded-full p-3 mt-1">
                      <Phone className="h-6 w-6 text-medical-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Call Us</h3>
                      <p className="text-gray-600 mb-1">General Inquiries:</p>
                      <p className="font-medium text-lg">(432)-202-2150</p>
                      <p className="text-gray-600 mb-1 mt-3">Emergency Pickup:</p>
                      <p className="font-medium text-lg text-medical-teal">(432)-202-2150</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-medical-blue/10 rounded-full p-3 mt-1">
                      <Mail className="h-6 w-6 text-medical-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Email Us</h3>
                      <p className="text-gray-600 mb-1">General Information:</p>
                      <p className="font-medium">catalystlogistics2025@gmail.com</p>
                      <p className="text-gray-600 mb-1 mt-3">Dispatch:</p>
                      <p className="font-medium">catalystlogistics2025@gmail.com</p>
                      <p className="text-gray-600 mb-1 mt-3">Customer Support:</p>
                      <p className="font-medium">catalystlogistics2025@gmail.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-medical-blue/10 rounded-full p-3 mt-1">
                      <MapPin className="h-6 w-6 text-medical-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Visit Us</h3>
                      <p className="font-medium">San Antonio, Texas 78254</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-medical-blue/10 rounded-full p-3 mt-1">
                      <Clock className="h-6 w-6 text-medical-blue" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Hours of Operation</h3>
                      <p className="text-gray-600 mb-1">Office Hours:</p>
                      <p className="font-medium">Monday - Friday: 8:00 AM - 6:00 PM<br />Saturday: 9:00 AM - 1:00 PM<br />Sunday: Closed</p>
                      <p className="text-gray-600 mb-1 mt-3">Dispatch Service:</p>
                      <p className="font-medium text-medical-teal">Available 24/7 for emergency pickups</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="bg-medical-lightGray p-8 rounded-lg">
                <h2 className="text-2xl font-bold text-medical-blue mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <Input 
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <Input 
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <Input 
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <Textarea 
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full min-h-[150px]"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={submitting}
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="bg-medical-lightGray py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-medical-blue mb-8 text-center">Our Location</h2>
            <div className="max-w-5xl mx-auto">
              <Map center={[-98.6615, 29.5301]} />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
