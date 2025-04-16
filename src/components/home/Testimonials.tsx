
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote: "ExpressMed Dispatch has revolutionized our laboratory's logistics. Their temperature-controlled transport ensures our specimens arrive in perfect condition every time.",
    author: "Dr. Sarah Rodriguez",
    title: "Laboratory Director, San Antonio General Hospital"
  },
  {
    quote: "The real-time tracking feature gives us peace of mind for urgent deliveries. We can see exactly where our critical samples are at any moment.",
    author: "Michael Chen, PharmD",
    title: "Pharmacy Manager, SA Medical Center"
  },
  {
    quote: "Their emergency response time is unmatched. When we need urgent transport for time-sensitive samples, ExpressMed is always there within minutes.",
    author: "Dr. James Wilson",
    title: "Emergency Department Chief, Methodist Hospital"
  },
  {
    quote: "The chain of custody documentation is flawless. Perfect for our compliance requirements and gives us complete confidence in the handling process.",
    author: "Patricia Alvarez",
    title: "Compliance Officer, UT Health San Antonio"
  }
];

export const Testimonials = () => {
  return (
    <section className="py-16 bg-medical-lightGray">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-medical-blue mb-4">Trusted by San Antonio's Healthcare Leaders</h2>
          <p className="text-gray-600">
            Hear what healthcare facilities across San Antonio are saying about our specialized medical courier services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-medical-blue/30 mb-4" />
                <p className="text-lg mb-6 text-gray-700">{testimonial.quote}</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
