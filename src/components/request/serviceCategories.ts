
export const serviceCategories = {
  medical: [
    { value: 'urgent', label: 'Urgent Delivery' },
    { value: 'same-day', label: 'Same-Day Delivery' },
    { value: 'scheduled', label: 'Scheduled Routes' },
    { value: 'temperature-controlled', label: 'Temperature-Controlled' },
    { value: 'specimen', label: 'Specimen Transport' },
    { value: 'equipment', label: 'Equipment Transport' },
    { value: 'pharmaceutical', label: 'Pharmaceutical Delivery' },
    { value: 'document', label: 'Document Courier' }
  ],
  baggage: [
    { value: 'airport-baggage', label: 'Airport Baggage Delivery' },
    { value: 'luggage-storage', label: 'Luggage Storage & Delivery' }
  ],
  pet: [
    { value: 'pet-transportation', label: 'Pet Transportation' },
    { value: 'veterinary-transport', label: 'Veterinary Transport' }
  ],
  home: [
    { value: 'furniture-delivery', label: 'Furniture Delivery' },
    { value: 'home-improvement', label: 'Home Improvement Materials' }
  ]
};

export const packageTypeMapping: Record<string, string> = {
  'urgent': 'medical_supplies',
  'same-day': 'medical_supplies',
  'scheduled': 'medical_supplies',
  'temperature-controlled': 'medical_supplies',
  'specimen': 'lab_samples',
  'equipment': 'equipment',
  'pharmaceutical': 'medication',
  'document': 'documents',
  'airport-baggage': 'baggage',
  'luggage-storage': 'baggage',
  'pet-transportation': 'pet_transport',
  'veterinary-transport': 'pet_transport',
  'furniture-delivery': 'furniture',
  'home-improvement': 'materials'
};

export const urgentServices = ['urgent', 'specimen', 'pharmaceutical'];
