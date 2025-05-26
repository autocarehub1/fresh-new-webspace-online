export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
      { headers: { 'User-Agent': 'ExpressMedDispatch/1.0 (contact@yourdomain.com)' } }
    );
    const data = await response.json();
    return data.display_name || `Near ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  } catch (e) {
    return `Near ${lat.toFixed(3)}, ${lng.toFixed(3)}`;
  }
} 