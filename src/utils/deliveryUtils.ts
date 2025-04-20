
export const generateTrackingId = () => {
  return `MED-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
};

export const estimateDeliveryCost = (distance: number, priority: string, packageType: string): number => {
  // Base rate
  let baseCost = 15;
  
  // Distance cost (assuming $2 per mile)
  const distanceCost = distance * 2;
  
  // Priority multiplier
  const priorityMultiplier = priority === 'urgent' ? 1.5 : 1;
  
  // Package type additional costs
  const packageMultiplier = packageType === 'temperature-controlled' ? 1.3 : 1;
  
  return Math.round((baseCost + distanceCost) * priorityMultiplier * packageMultiplier);
};
