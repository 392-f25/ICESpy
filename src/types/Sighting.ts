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
}

