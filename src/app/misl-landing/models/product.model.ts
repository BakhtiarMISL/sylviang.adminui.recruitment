export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  features: string[];
  ctaLabel: string;
  ctaLink: string;
  badge?: string;
}
