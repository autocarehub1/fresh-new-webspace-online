
import { useState, useEffect, useRef, useCallback } from 'react';
import { DeliveryRequest, DeliveryStatus } from '@/types/delivery';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseDeliveryTrackingOptions {
  delivery: DeliveryRequest | null;
}

interface TrackingState {
  isLiveTracking: boolean;
  simulationSpeed: 'slow' | 'normal' | 'fast';
  eta: { distance: string; eta: number } | null;
  trafficCondition: 'good' | 'moderate' | 'heavy';
  detailedStatus: string;
  etaStart: number | null;
  etaEnd: number | null;
  etaCountdown: number | null;
  etaProgress: number;
}

export const useDeliveryTracking = ({ delivery }: UseDeliveryTrackingOptions) => {
  const [trackingState, setTrackingState] = useState<TrackingState>({
    isLiveTracking: false,
    simulationSpeed: 'normal',
    eta: null,
    trafficCondition: 'good',
    detailedStatus: '',
    etaStart: null,
    etaEnd: null,
    etaCountdown: null,
    etaProgress: 0
  });

  const intervalRef = useRef<number | null>(null);

  // Calculate ETA based on distance and speed
  const calculateETA = useCallback((
    current: { lat: number; lng: number }, 
    destination: { lat: number; lng: number }, 
    averageSpeed: number = 30
  ) => {
    const R = 6371; // Earth's radius in km
    
    const lat1 = current.lat * Math.PI / 180;
    const lon1 = current.lng * Math.PI / 180;
    const lat2 = destination.lat * Math.PI / 180;
    const lon2 = destination.lng * Math.PI / 180;
    
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    const timeInMinutes = (distance / averageSpeed) * 60;
    
    return {
      distance: distance.toFixed(1),
      eta: Math.round(timeInMinutes)
    };
  }, []);

  // Update ETA and detailed status
  const updateETA = useCallback(() => {
    if (!delivery || !delivery.current_coordinates || !delivery.delivery_coordinates) return;
    
    const speeds = {
      good: 30,
      moderate: 20,
      heavy: 10,
    };
    
    const etaData = calculateETA(
      delivery.current_coordinates, 
      delivery.delivery_coordinates, 
      speeds[trackingState.trafficCondition]
    );
    
    setTrackingState(prev => ({ ...prev, eta: etaData }));
    
    const distance = parseFloat(etaData.distance);
    
    let newDetailedStatus = '';
    if (distance < 0.5) {
      newDetailedStatus = 'Arriving soon (less than 0.5km away)';
    } else if (distance < 1) {
      newDetailedStatus = 'Approaching destination';
    } else if (distance < 3) {
      newDetailedStatus = 'In delivery area';
    } else {
      newDetailedStatus = 'En route to delivery location';
    }
    
    setTrackingState(prev => ({ ...prev, detailedStatus: newDetailedStatus }));
  }, [delivery, trackingState.trafficCondition, calculateETA]);

  // Calculate movement helper
  const calculateMovement = useCallback((
    current: { lat: number; lng: number }, 
    target: { lat: number; lng: number }, 
    stepSize: number
  ) => {
    const latDiff = target.lat - current.lat;
    const lngDiff = target.lng - current.lng;
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
    
    if (distance < 0.002) {
      return null;
    }
    
    return {
      lat: current.lat + (latDiff / distance) * stepSize,
      lng: current.lng + (lngDiff / distance) * stepSize
    };
  }, []);

  // Update delivery position
  const updateDeliveryPosition = useCallback(async (coordinates: { lat: number; lng: number }) => {
    if (!delivery) return;
    
    console.log('Updating delivery position:', coordinates);
    
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ current_coordinates: coordinates })
        .eq('id', delivery.id);
      
      if (error) {
        console.error('Error updating position in database:', error);
      }
    } catch (err) {
      console.error('Failed to update position in database:', err);
    }
  }, [delivery]);

  // Update delivery status
  const updateDeliveryStatus = useCallback(async (status: DeliveryStatus) => {
    if (!delivery) return;
    
    console.log('Updating delivery status to:', status);
    
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status,
          ...(status === 'completed' ? { current_coordinates: delivery.delivery_coordinates } : {})
        })
        .eq('id', delivery.id);
      
      if (error) {
        console.error('Error updating status in database:', error);
      }
      
      const update = {
        delivery_id: delivery.id,
        status: status === 'in_progress' ? 'Driver En Route' : status.charAt(0).toUpperCase() + status.slice(1),
        timestamp: new Date().toISOString(),
        location: status === 'completed' ? delivery.delivery_location : delivery.pickup_location,
        note: status === 'completed' ? 'Package has been delivered successfully' : `Delivery status updated to ${status}`
      };
      
      await supabase
        .from('tracking_updates')
        .insert(update);
      
    } catch (err) {
      console.error('Failed to update status in database:', err);
    }
  }, [delivery]);

  // Start live tracking simulation
  const startLiveTracking = useCallback((speed: 'slow' | 'normal' | 'fast' = 'normal') => {
    if (!delivery || intervalRef.current) return;
    
    console.log('Starting live tracking simulation at speed:', speed);
    setTrackingState(prev => ({ 
      ...prev, 
      isLiveTracking: true, 
      simulationSpeed: speed 
    }));
    
    const intervalTime = speed === 'slow' ? 5000 : speed === 'fast' ? 1000 : 3000;
    
    // Randomly set traffic condition
    const trafficOptions: Array<'good' | 'moderate' | 'heavy'> = ['good', 'moderate', 'heavy'];
    const newTraffic = trafficOptions[Math.floor(Math.random() * trafficOptions.length)];
    setTrackingState(prev => ({ ...prev, trafficCondition: newTraffic }));
    
    intervalRef.current = window.setInterval(() => {
      if (!delivery || delivery.status !== 'in_progress') return;
      
      console.log('Simulating movement for delivery:', delivery.id);
      
      const current = delivery.current_coordinates;
      const target = delivery.delivery_coordinates;
      
      if (!current || !target) {
        console.log('Missing coordinates, cannot simulate movement');
        return;
      }
      
      const trafficFactor = trackingState.trafficCondition === 'good' ? 1.0 : 
                           trackingState.trafficCondition === 'moderate' ? 0.7 : 0.4;
      
      const stepSize = 0.001 * trafficFactor;
      const newCoordinates = calculateMovement(current, target, stepSize);
      
      if (!newCoordinates) {
        console.log('Reached destination, stopping simulation');
        updateDeliveryStatus('completed');
        stopLiveTracking();
        return;
      }
      
      updateDeliveryPosition(newCoordinates);
      updateETA();
      
      // Occasionally change traffic conditions (10% chance)
      if (Math.random() < 0.1) {
        const newTraffic = trafficOptions[Math.floor(Math.random() * trafficOptions.length)];
        setTrackingState(prev => {
          if (newTraffic !== prev.trafficCondition) {
            const trafficMessages = {
              good: 'Traffic is flowing well',
              moderate: 'Moderate traffic conditions',
              heavy: 'Heavy traffic encountered'
            };
            toast.info(`Traffic Update: ${trafficMessages[newTraffic]}`);
          }
          return { ...prev, trafficCondition: newTraffic };
        });
      }
    }, intervalTime);
    
    return () => stopLiveTracking();
  }, [delivery, updateETA, calculateMovement, updateDeliveryPosition, updateDeliveryStatus, trackingState.trafficCondition]);

  // Stop live tracking
  const stopLiveTracking = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTrackingState(prev => ({ ...prev, isLiveTracking: false }));
  }, []);

  // Reset simulation
  const resetSimulation = useCallback(async () => {
    if (!delivery) return;
    
    stopLiveTracking();
    
    try {
      const { error } = await supabase
        .from('delivery_requests')
        .update({ 
          status: 'in_progress',
          current_coordinates: delivery.pickup_coordinates
        })
        .eq('id', delivery.id);
      
      if (error) {
        console.error('Error resetting simulation:', error);
        toast.error('Failed to reset simulation');
        return;
      }
      
      toast.success('Simulation reset to starting point');
      
      setTimeout(() => startLiveTracking(trackingState.simulationSpeed), 500);
    } catch (err) {
      console.error('Error in resetSimulation:', err);
      toast.error('Failed to reset simulation');
    }
  }, [delivery, stopLiveTracking, startLiveTracking, trackingState.simulationSpeed]);

  // Handle speed change
  const handleSpeedChange = useCallback((speed: 'slow' | 'normal' | 'fast') => {
    setTrackingState(prev => ({ ...prev, simulationSpeed: speed }));
    if (trackingState.isLiveTracking) {
      stopLiveTracking();
      setTimeout(() => startLiveTracking(speed), 100);
    }
  }, [trackingState.isLiveTracking, stopLiveTracking, startLiveTracking]);

  // Update ETA when delivery changes
  useEffect(() => {
    if (delivery?.current_coordinates && delivery?.delivery_coordinates) {
      updateETA();
    }
  }, [delivery, updateETA]);

  // Initialize ETA times when delivery starts
  useEffect(() => {
    if (delivery?.status === 'in_progress' && trackingState.eta) {
      if (!trackingState.etaStart) {
        const now = Date.now();
        const etaEnd = now + trackingState.eta.eta * 60 * 1000;
        setTrackingState(prev => ({
          ...prev,
          etaStart: now,
          etaEnd: etaEnd,
          etaCountdown: trackingState.eta!.eta * 60
        }));
      }
    } else {
      setTrackingState(prev => ({
        ...prev,
        etaStart: null,
        etaEnd: null,
        etaCountdown: null
      }));
    }
  }, [delivery?.status, trackingState.eta]);

  // Countdown timer
  useEffect(() => {
    if (trackingState.etaEnd && delivery?.status === 'in_progress') {
      const interval = setInterval(() => {
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.round((trackingState.etaEnd! - now) / 1000));
        setTrackingState(prev => ({ ...prev, etaCountdown: secondsLeft }));
        if (secondsLeft <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [trackingState.etaEnd, delivery?.status]);

  // Calculate progress
  useEffect(() => {
    if (trackingState.etaStart && trackingState.etaEnd && delivery?.status === 'in_progress') {
      const progress = Math.min(100, Math.max(0, 
        ((Date.now() - trackingState.etaStart) / (trackingState.etaEnd - trackingState.etaStart)) * 100
      ));
      setTrackingState(prev => ({ ...prev, etaProgress: progress }));
    } else {
      setTrackingState(prev => ({ ...prev, etaProgress: 0 }));
    }
  }, [trackingState.etaStart, trackingState.etaEnd, delivery?.status]);

  // Auto-start tracking for in-progress deliveries
  useEffect(() => {
    if (delivery && delivery.status === 'in_progress' && !trackingState.isLiveTracking) {
      startLiveTracking(trackingState.simulationSpeed);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [delivery, startLiveTracking, trackingState.isLiveTracking, trackingState.simulationSpeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    ...trackingState,
    startLiveTracking,
    stopLiveTracking,
    resetSimulation,
    handleSpeedChange
  };
};
