import { CollectionPoint } from '../models/collection-point.model';
import { Disposal } from '../models/disposal.model';

export const samplePoint: CollectionPoint = {
    id: 'point-1',
    name: 'Eco Ponto Central',
    description: 'Coleta municipal',
    address: { street: 'Avenida Brasil', number: '1000', neighborhood: 'Centro', city: 'Maringá', state: 'PR', zipCode: '87000-000' },
    acceptedMaterials: ['BATTERY', 'GLASS'],
    openingHours: '08:00 - 18:00'
};

export const sampleDisposal: Disposal = {
    id: 'disposal-1',
    collectionPointId: 'point-1',
    materialType: 'BATTERY',
    quantity: 10,
    unit: 'UNITS',
    disposalDate: '2026-09-11T10:00:00'
};
