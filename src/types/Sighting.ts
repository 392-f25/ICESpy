export type SightingCategory = 'ICE activity' | 'Police activity' | 'Accident' | 'Crime' | 'Lost items' | 'Other';

export type Sighting ={
    id: string;
    firebaseKey?: string;
    title: string;
    location: string;
    time: Date;
    description?: string;
    imageUrls?: string[];
    upvotes: number;
    corroborationCount?: number;
    category: SightingCategory;
}

export const CATEGORY_COLORS: Record<SightingCategory, { bg: string; text: string; pin: string }> = {
  'ICE activity': { bg: 'bg-red-100', text: 'text-red-800', pin: '#ef4444' },
  'Police activity': { bg: 'bg-blue-100', text: 'text-blue-800', pin: '#3b82f6' },
  'Accident': { bg: 'bg-yellow-100', text: 'text-yellow-800', pin: '#eab308' },
  'Crime': { bg: 'bg-purple-100', text: 'text-purple-800', pin: '#a855f7' },
  'Lost items': { bg: 'bg-green-100', text: 'text-green-800', pin: '#22c55e' },
  'Other': {bg: 'bg-gray-100', text: 'text-gray-800', pin:'#676767'}
};

