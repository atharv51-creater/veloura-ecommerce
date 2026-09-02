import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, Product, ProductColor } from '../types';

interface Coupon {
  code: string;
  discountPercent: number;
  description: string;
}

interface CartContextType {
  cart: CartItem[];
  items: CartItem[];
  addToCart: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  coupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
  lastAddedItem: CartItem | null;
  clearLastAddedItem: () => void;
}

const CART_STORAGE_KEY = 'veloura_cart';

const VALID_COUPONS: Record<string, { percent: number; description: string }> = {
  VELOURA15: { percent: 15, description: '15% Off Your Veloura Order' },
  AURA20: { percent: 20, description: '20% Member Aura Privileges' },
  FIRST10: { percent: 10, description: '10% Welcome First Purchase' },
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [];
  });

  const [coupon, setCoupon] = useState<Coupon | null>(() => {
    try {
      const savedCoupon = localStorage.getItem('veloura_coupon');
      if (savedCoupon) {
        return JSON.parse(savedCoupon);
      }
    } catch {
      // Fallback
    }
    return null;
  });

  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage unavailable
    }
  }, [cart]);

  useEffect(() => {
    try {
      if (coupon) {
        localStorage.setItem('veloura_coupon', JSON.stringify(coupon));
      } else {
        localStorage.removeItem('veloura_coupon');
      }
    } catch {
      // Storage unavailable
    }
  }, [coupon]);

  const addToCart = (product: Product, size: string, color: ProductColor, quantity = 1) => {
    const itemId = `${product.id}-${size}-${color.name.toLowerCase().replace(/\s+/g, '-')}`;

    // Compute the resulting item outside of the state updater so this stays a
    // pure functional update (no side effects inside setCart's callback,
    // which React can otherwise invoke more than once, e.g. under
    // StrictMode) and the "added to bag" toast fires exactly once per call.
    let addedItem: CartItem | null = null;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === itemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        addedItem = updated[existingIndex];
        return updated;
      }
      const newItem: CartItem = {
        id: itemId,
        product,
        size,
        color,
        quantity,
      };
      addedItem = newItem;
      return [...prev, newItem];
    });

    if (addedItem) {
      setLastAddedItem(addedItem);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setCoupon(null);
  };

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (VALID_COUPONS[cleanCode]) {
      const found = VALID_COUPONS[cleanCode];
      const newCoupon = {
        code: cleanCode,
        discountPercent: found.percent,
        description: found.description,
      };
      setCoupon(newCoupon);
      return { success: true, message: `Promo code "${cleanCode}" applied! ${found.percent}% off` };
    }
    return { success: false, message: 'Invalid promo code. Try VELOURA15 or AURA20' };
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const clearLastAddedItem = () => {
    setLastAddedItem(null);
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Free shipping on orders over ₹1,500 or empty cart
  const shipping = subtotal === 0 || subtotal >= 1500 ? 0 : 150;

  const discount = coupon ? Math.round((subtotal * coupon.discountPercent) / 100) : 0;

  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <CartContext.Provider
      value={{
        cart,
        items: cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        shipping,
        discount,
        total,
        itemCount,
        lastAddedItem,
        clearLastAddedItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
