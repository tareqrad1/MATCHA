// Shared domain types for the MATCHA store.

export interface Product {
  id: string;
  kind: string;
  name: string;
  tagline: string;
  price: number;
  unit: string;
  image: string;
  notes: string[];
  description: string;
  accent: string;
}

/** A product in the cart, with the chosen quantity. */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  accent: string;
  qty: number;
}
