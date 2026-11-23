export type FellowshipLocation = {
  id: string;
  name: string;
  continent: "Africa" | "Asia" | "Europe" | "North America" | "South America" | "Oceania";
  country: string;
  stateOrArea: string;
  address: string;
  phone: string;
  email: string;
  overseerName?: string;
  overseerTitle?: string;
  overseerPhone?: string;
  overseerEmail?: string;
  overseerPhotoUrl?: string;
  isHeadquarters?: boolean;
  latitude?: number;
  longitude?: number;
};
