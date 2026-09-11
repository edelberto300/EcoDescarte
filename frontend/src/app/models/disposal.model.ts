import { MaterialType } from './collection-point.model';

export type DisposalUnit = 'UNITS' | 'KG' | 'LITERS';

export interface DisposalInput {
    materialType: MaterialType;
    quantity: number;
    unit: DisposalUnit;
    disposalDate?: string;
}

export interface Disposal extends DisposalInput {
    id: string;
    collectionPointId: string;
    disposalDate: string;
}

export const UNIT_LABELS: Record<DisposalUnit, string> = {
    UNITS: 'Unidades',
    KG: 'Quilogramas',
    LITERS: 'Litros'
};

export const DISPOSAL_UNITS: readonly DisposalUnit[] = ['UNITS', 'KG', 'LITERS'];
