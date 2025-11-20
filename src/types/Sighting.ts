export type Sighting ={
    id: string;
    title: string;
    location: string;
    time: Date;
    description?: string;
    imageUrls?: string[];
    corroborationCount: number;
}

