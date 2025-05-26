
export const createTrackingUrl = (trackingId: string): string => {
  return `${window.location.origin}/tracking?id=${trackingId}`;
};
