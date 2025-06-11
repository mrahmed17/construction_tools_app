import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CartItem = {
  id: string;
  category: string;
  company?: string;
  productType: string;
  color?: string;
  size?: string;
  thickness?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalAmount: () => number;
  getTotalProfit: () => number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from storage when app loads
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(items));
      } catch (error) {
        console.error('Failed to save cart:', error);
      }
    };
    
    saveCart();
  }, [items]);

  const addItem = (item: CartItem) => {
    setItems((prevItems) => {
      // Check if the item already exists
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return items.reduce(
      (total, item) => total + item.sellingPrice * item.quantity,
      0
    );
  };

  const getTotalProfit = () => {
    return items.reduce(
      (total, item) => total + (item.sellingPrice - item.purchasePrice) * item.quantity,
      0
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalAmount,
        getTotalProfit,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};