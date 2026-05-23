'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { Product, CartItem } from '@/types';

/**
 * Global cart store. Items are keyed by product id and carry the fields the
 * cart UI needs (id, name, price, unit, image, accent) plus a qty. State is
 * persisted to localStorage so a refresh keeps the bag.
 */

interface LastAdded {
  product: Product;
  qty: number;
  at: number;
}

interface CartState {
  items: CartItem[];
}

type CartAction =
  | { type: 'ADD'; product: Product; qty?: number }
  | { type: 'REMOVE'; id: string }
  | { type: 'SET_QTY'; id: string; qty: number }
  | { type: 'CLEAR' };

interface CartValue {
  items: CartItem[];
  count: number;
  lineCount: number;
  subtotal: number;
  lastAdded: LastAdded | null;
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = 'matcha.cart.v1';

const initial = (): CartState => {
  if (typeof window === 'undefined') return { items: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { items: JSON.parse(raw) as CartItem[] } : { items: [] };
  } catch {
    return { items: [] };
  }
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD': {
      const { product, qty = 1 } = action;
      const existing = state.items.find((i) => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === product.id ? { ...i, qty: i.qty + qty } : i
          ),
        };
      }
      const { id, name, price, unit, image, accent } = product;
      return {
        items: [...state.items, { id, name, price, unit, image, accent, qty }],
      };
    }
    case 'REMOVE':
      return { items: state.items.filter((i) => i.id !== action.id) };
    case 'SET_QTY': {
      const qty = Math.max(1, action.qty);
      return {
        items: state.items.map((i) => (i.id === action.id ? { ...i, qty } : i)),
      };
    }
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);
  // The most recent add, used to surface a confirmation toast. Carries a
  // nonce so adding the same product twice still re-triggers the toast.
  const [lastAdded, setLastAdded] = useState<LastAdded | null>(null);

  // Persist on every change.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* storage may be unavailable; cart still works in-memory */
    }
  }, [state.items]);

  const add = useCallback((product: Product, qty = 1) => {
    dispatch({ type: 'ADD', product, qty });
    setLastAdded({ product, qty, at: Date.now() });
  }, []);

  const value = useMemo<CartValue>(() => {
    // `count` = total units (sum of quantities); `lineCount` = distinct
    // products. The badge/toast use lineCount; totals use count.
    const count = state.items.reduce((n, i) => n + i.qty, 0);
    const lineCount = state.items.length;
    const subtotal = state.items.reduce((s, i) => s + i.price * i.qty, 0);
    return {
      items: state.items,
      count,
      lineCount,
      subtotal,
      lastAdded,
      add,
      remove: (id: string) => dispatch({ type: 'REMOVE', id }),
      setQty: (id: string, qty: number) => dispatch({ type: 'SET_QTY', id, qty }),
      clear: () => dispatch({ type: 'CLEAR' }),
    };
  }, [state.items, lastAdded, add]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
