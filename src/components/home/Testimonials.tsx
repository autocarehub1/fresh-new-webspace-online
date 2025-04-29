import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

// Type definition for Google review
interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  time: number;
  profile_photo_url?: string;
}

export const Testimonials = () => {
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch Google reviews - to be implemented when reviews are available
  const fetchGoogleReviews = async () => {
    try {
      setLoading(true);
      // Implementation will go here once you have Google reviews to fetch
      // This would typically involve calling your backend API that interfaces with the Google Places API
      
      // For example:
      // const response = await fetch('/api/google-reviews');
      // const data = await response.json();
      // setReviews(data.reviews);
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError('Failed to load reviews');
      console.error('Error fetching Google reviews:', err);
    }
  };

  useEffect(() => {
    // This will be uncommented when you're ready to fetch reviews
    // fetchGoogleReviews();
  }, []);

  // Don't render anything if no reviews are available
  if (reviews.length === 0 && !loading) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 bg-medical-lightGray">
        <div className="container mx-auto px-4 text-center">
          <p>Loading reviews...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return null; // Don't show error states to end users
  }

  return (
    <section className="py-16 bg-medical-lightGray">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-medical-blue mb-4">What Our Clients Say</h2>
          <p className="text-gray-600">
            See what healthcare facilities across San Antonio are saying about our specialized medical courier services.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <Card key={index} className="border-gray-200">
              <CardContent className="p-8">
                <Quote className="h-8 w-8 text-medical-blue/30 mb-4" />
                <div className="flex items-center mb-4">
                  {/* Display stars based on rating */}
                  <div className="flex text-yellow-400 mr-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                    ))}
                  </div>
                  <span className="text-gray-600">{review.rating}/5</span>
                </div>
                <p className="text-lg mb-6 text-gray-700">{review.text}</p>
                <div className="flex items-center">
                  {review.profile_photo_url && (
                    <img 
                      src={review.profile_photo_url} 
                      alt={review.author_name} 
                      className="w-10 h-10 rounded-full mr-3"
                    />
                  )}
                  <div>
                    <p className="font-semibold">{review.author_name}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(review.time * 1000).toLocaleDateString()}
                    </p>
                  </div>
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
