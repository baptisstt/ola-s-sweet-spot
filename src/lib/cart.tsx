import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartModifier = {
  id: string;
  name: string;
  price: number;
};

export type CartItem = {
  key: string;
  productId: string;
  name: string;
  imageUrl: string | null;
  unitPrice: number;
  quantity: number;
  notes: string;
  modifiers: CartModifier[];
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  addItem: (item: Omit<CartItem, "key">) => void;
  updateQuantity: (key: string, quantity: number) => void;
  updateNotes: (key: string, notes: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const STORAGE_KEY = "dinos.cart.v1";

const CartContext = createContext<CartContextValue | null>(null);

export function itemTotal(item: CartItem): number {
  const unit = item.unitPrice + item.modifiers.reduce((sum, m) => sum + m.price, 0);
  return unit * item.quantity;
}

function makeKey(item: Omit<CartItem, "key">): string {
  const mods = item.modifiers
    .map((m) => m.id)
    .sort()
    .join(",");
  return `${item.productId}|${mods}|${item.notes.trim()}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore corrupted cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable */
    }
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + itemTotal(i), 0);

    return {
      items,
      count,
      subtotal,
      ready,
      addItem: (item) => {
        const key = makeKey(item);
        setItems((prev) => {
          const existing = prev.find((i) => i.key === key);
          if (existing) {
            return prev.map((i) =>
              i.key === key ? { ...i, quantity: i.quantity + item.quantity } : i,
            );
          }
          return [...prev, { ...item, key }];
        });
      },
      updateQuantity: (key, quantity) =>
        setItems((prev) =>
          quantity <= 0
            ? prev.filter((i) => i.key !== key)
            : prev.map((i) => (i.key === key ? { ...i, quantity } : i)),
        ),
      updateNotes: (key, notes) =>
        setItems((prev) => prev.map((i) => (i.key === key ? { ...i, notes } : i))),
      removeItem: (key) => setItems((prev) => prev.filter((i) => i.key !== key)),
      clear: () => setItems([]),
    };
  }, [items, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
