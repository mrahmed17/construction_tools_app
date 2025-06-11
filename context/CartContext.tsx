import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define cart item type
export type CartItem = {
  id: string;
  category: string;
  company?: string;
  product?: string;
  color?: string;
  size?: string;
  thickness?: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
};

// Define cart context type
type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalProfit: number;
  discount: number;
  setDiscount: React.Dispatch<React.SetStateAction<number>>;
  netAmount: number;
};

// Create context with default values
const CartContext = createContext<CartContextType>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalAmount: 0,
  totalProfit: 0,
  discount: 0,
  setDiscount: () => {},
  netAmount: 0,
});

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  
  // Calculate total amount and profit
  const totalAmount = items.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
  const totalProfit = items.reduce((sum, item) => sum + item.profit, 0);
  const netAmount = totalAmount - discount;
  
  // Load cart from AsyncStorage on component mount
  useEffect(() => {
    const loadCartFromStorage = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          setItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    };
    
    loadCartFromStorage();
  }, []);
  
  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        // Save to local storage
        await AsyncStorage.setItem('cart', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };
    
    // Only save if there are items or if we've loaded the component
    if (items.length > 0) {
      saveCart();
    }
  }, [items]);
  
  // Add item to cart
  const addItem = (item: Omit<CartItem, 'id'>) => {
    const newItem = {
      ...item,
      id: Date.now().toString() // Simple ID generation
    };
    
    setItems(prevItems => [...prevItems, newItem]);
  };
  
  // Remove item from cart
  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Clear cart
  const clearCart = () => {
    setItems([]);
    setDiscount(0);
    
    // Also clear from storage
    AsyncStorage.removeItem('cart');
  };
  
  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    totalAmount,
    totalProfit,
    discount,
    setDiscount,
    netAmount,
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};