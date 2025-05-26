import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * This component handles direct access to URLs with query parameters,
 * particularly for the tracking page.
 */
export const QueryParamHandler = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we need to redirect to tracking based on sessionStorage
    const redirectTrackingId = sessionStorage.getItem('redirectToTracking');
    if (redirectTrackingId) {
      console.log('Redirecting to tracking from sessionStorage:', redirectTrackingId);
      sessionStorage.removeItem('redirectToTracking');
      navigate(`/tracking?id=${redirectTrackingId}`, { replace: true });
      return;
    }

    // Check if we're at the root with a tracking ID in the query params
    // This handles cases where the server redirects all requests to the root
    const params = new URLSearchParams(location.search);
    const trackingId = params.get('id');
    
    if (trackingId && location.pathname === '/') {
      console.log('Redirecting to tracking page with ID from URL params:', trackingId);
      // Redirect to the tracking page with the ID
      navigate(`/tracking?id=${trackingId}`, { replace: true });
    }
    
    // Handle direct access to tracking URLs
    if (location.pathname === '/tracking' && trackingId) {
      console.log('Direct access to tracking page with ID:', trackingId);
      // The Tracking component will handle this case
    }
  }, [location, navigate]);

  return null;
};

export default QueryParamHandler; 