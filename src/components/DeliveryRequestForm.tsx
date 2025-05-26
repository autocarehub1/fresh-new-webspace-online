import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import * as Slack from '@/integrations/slack';

export default function DeliveryRequestForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<{
    success?: boolean;
    message?: string;
  }>({});
  const [formData, setFormData] = useState({
    pickup_location: '',
    delivery_location: '',
    packageType: 'Standard',
    priority: 'normal',
    email: '',
    phone: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({});

    try {
      // Generate a unique ID for the request
      const requestId = `REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create the full request object
      const request = {
        ...formData,
        id: requestId,
        status: 'new',
        created_at: new Date().toISOString()
      };
      
      console.log('Submitting request:', request);
      
      // Save the request to your API/database
      console.log('POST URL:', '/api/requests');
      const response = await axios.post('/api/requests', request, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log('Request saved - Response:', response.data);
      
      // IMPORTANT: Send Slack notification directly through the server-side proxy
      // This is the most reliable method
      try {
        console.log('Sending Slack notification...');
        console.log('POST URL:', '/api/slack/send');
        const slackResponse = await axios.post('/api/slack/send', {
          text: `🆕 New Delivery Request: ${requestId}`,
          blocks: [
            {
              type: "header",
              text: {
                type: "plain_text",
                text: "🚚 New Delivery Request",
                emoji: true
              }
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Request ID:*\n${requestId}`
                },
                {
                  type: "mrkdwn",
                  text: `*Priority:*\n${formData.priority}`
                }
              ]
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Pickup:*\n${formData.pickup_location}`
                },
                {
                  type: "mrkdwn",
                  text: `*Delivery:*\n${formData.delivery_location}`
                }
              ]
            },
            {
              type: "section",
              fields: [
                {
                  type: "mrkdwn",
                  text: `*Contact:*\n${formData.email || 'No email provided'}`
                },
                {
                  type: "mrkdwn",
                  text: `*Time:*\n${new Date().toLocaleString()}`
                }
              ]
            }
          ]
        });
        
        console.log('Slack notification response:', slackResponse.data);
        
        if (!slackResponse.data.success) {
          throw new Error(`Slack API returned error: ${slackResponse.data.error}`);
        }
        
        console.log('Slack notification sent successfully via API route');
        
        // As a backup, also use the unified Slack notification system
        try {
          const slackResult = await Slack.notifyNewRequest(request);
          console.log('Unified Slack notification result:', slackResult);
          
          if (!slackResult) {
            console.warn('Unified Slack notification returned false');
          }
        } catch (slackError) {
          console.error('Error with unified Slack notification:', slackError);
          // Continue execution even if this fails
        }
      } catch (slackError) {
        console.error('Error sending Slack notification via API route:', slackError);
        // Log the full error object for debugging
        console.error('Full error object:', JSON.stringify(slackError, null, 2));
        // We continue even if Slack notification fails
      }
      
      // Show success message
      setFormStatus({
        success: true,
        message: 'Request submitted successfully!'
      });
      
      // Reset form
      setFormData({
        pickup_location: '',
        delivery_location: '',
        packageType: 'Standard',
        priority: 'normal',
        email: '',
        phone: '',
        notes: ''
      });
      
      // Redirect to tracking page or thank you page
      setTimeout(() => {
        router.push(`/tracking/${requestId}`);
      }, 1500);
      
    } catch (error) {
      console.error('Error submitting request:', error);
      setFormStatus({
        success: false,
        message: 'There was an error submitting your request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">Request Medical Delivery</h2>
      
      {formStatus.message && (
        <div className={`mb-4 p-4 rounded ${formStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {formStatus.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pickup_location">
            Pickup Location
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="pickup_location"
            name="pickup_location"
            type="text"
            value={formData.pickup_location}
            onChange={handleChange}
            placeholder="Enter pickup address"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="delivery_location">
            Delivery Location
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="delivery_location"
            name="delivery_location"
            type="text"
            value={formData.delivery_location}
            onChange={handleChange}
            placeholder="Enter delivery address"
            required
          />
        </div>
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="packageType">
              Package Type
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="packageType"
              name="packageType"
              value={formData.packageType}
              onChange={handleChange}
            >
              <option value="Standard">Standard</option>
              <option value="Medication">Medication</option>
              <option value="Temperature Controlled">Temperature Controlled</option>
              <option value="Hazardous">Hazardous</option>
              <option value="Fragile">Fragile</option>
            </select>
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="priority">
              Priority
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
              Phone
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(555) 123-4567"
            />
          </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
            Additional Notes
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any special instructions or details"
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
} 