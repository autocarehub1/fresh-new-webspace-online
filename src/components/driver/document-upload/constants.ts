
import { DocumentType } from './types';

export const documentTypes: DocumentType[] = [
  {
    id: 'license',
    name: 'Driver License',
    description: 'Front and back of your valid driver license',
    required: true,
    maxSize: 5,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },
  {
    id: 'insurance',
    name: 'Vehicle Insurance',
    description: 'Current vehicle insurance certificate',
    required: true,
    maxSize: 5,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },
  {
    id: 'registration',
    name: 'Vehicle Registration',
    description: 'Current vehicle registration document',
    required: true,
    maxSize: 5,
    acceptedTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  },
  {
    id: 'background_check',
    name: 'Background Check',
    description: 'Recent background check certificate (if available)',
    required: false,
    maxSize: 5,
    acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png']
  }
];
