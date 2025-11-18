export type Sighting ={

    id: string;
    title: string;
    location: string;
    zipCode: string;
    time: Date;
    description?: string;
    imageUrls?: string[];
    corroborationCount: number;

}

