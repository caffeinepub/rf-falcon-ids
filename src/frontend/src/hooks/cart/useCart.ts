import { useState, useEffect } from 'react';
import { CartItem } from './cartTypes';

const CART_STORAGE_KEY = 'falcon-ids-cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const replaceWithFailedItems = (failedItems: CartItem[]) => {
    setItems(failedItems);
  };

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    replaceWithFailedItems,
    itemCount: items.length,
  };
}
