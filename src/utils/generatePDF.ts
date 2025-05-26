
import jsPDF from 'jspdf';
import { DeliveryRequest } from '@/types/delivery';

export const generatePDF = (delivery: DeliveryRequest) => {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text('Delivery Receipt', 20, 30);
  
  doc.setFontSize(12);
  doc.text(`Tracking ID: ${delivery.trackingId || delivery.id}`, 20, 50);
  doc.text(`From: ${delivery.pickup_location}`, 20, 70);
  doc.text(`To: ${delivery.delivery_location}`, 20, 90);
  doc.text(`Status: ${delivery.status}`, 20, 110);
  doc.text(`Priority: ${delivery.priority}`, 20, 130);
  
  doc.save(`delivery-${delivery.trackingId || delivery.id}.pdf`);
};
