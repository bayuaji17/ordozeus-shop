export interface CollectionProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  primaryImage: string | null;
  sizes: {
    id: string;
    name: string;
    stock: number;
  }[];
}

export interface CollectionSection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  imageUrl: string | null;
  productCount: number;
  products: CollectionProduct[];
  hasMoreProducts: boolean;
}

export interface CollectionPageData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  sections: CollectionSection[];
}
