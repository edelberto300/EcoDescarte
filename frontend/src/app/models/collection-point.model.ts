export type MaterialType = 'BATTERY' | 'ELECTRONICS' | 'COOKING_OIL' | 'GLASS'
    | 'MEDICINE' | 'LIGHT_BULB' | 'OTHER';

export interface Address {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}

export interface CollectionPointInput {
    name: string;
    description: string;
    address: Address;
    acceptedMaterials: MaterialType[];
    openingHours: string;
}

export interface CollectionPoint extends CollectionPointInput {
    id: string;
}

export const MATERIAL_LABELS: Record<MaterialType, string> = {
    BATTERY: 'Pilhas e baterias',
    ELECTRONICS: 'Eletrônicos',
    COOKING_OIL: 'Óleo de cozinha',
    GLASS: 'Vidro',
    MEDICINE: 'Medicamentos',
    LIGHT_BULB: 'Lâmpadas',
    OTHER: 'Outros'
};

export const MATERIAL_TYPES: readonly MaterialType[] = [
    'BATTERY', 'ELECTRONICS', 'COOKING_OIL', 'GLASS', 'MEDICINE', 'LIGHT_BULB', 'OTHER'
];
