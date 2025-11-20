export type User = {
    id: string;
    username: string;
    email: string;
    corroborations: string[];
    zipCode: string;
    // future use: either use distance from zip code, distance from lat/lon,
    // selected list of zip codes, or selected list of cities
}