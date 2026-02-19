/**
 * Cart types
 */

export interface CartItem {
  id: string; // productId + sizeId combined
  productId: string;
  productSlug: string;
  name: string;
  sizeId: string;
  sizeName: string;
  price: number; // in cents
  quantity: number;
  image: string | null;
  maxStock: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

export interface CartSummary {
  subtotal: number;
  itemCount: number;
  totalItems: number;
}

export interface AddToCartInput {
  productId: string;
  productSlug: string;
  name: string;
  sizeId: string;
  sizeName: string;
  price: number;
  image: string | null;
  maxStock: number;
  quantity?: number;
}
