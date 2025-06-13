import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { Product } from './ProductContext';

// Define cart item type
export interface CartItem {
  id: string;
  category: string;
  company?: string;
  type?: string;
  color?: string;
  thickness?: string;
  size?: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
}

// Define cart context type
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  calculateTotal: () => number;
  calculateProfit: () => number;
}

// Create the context
export const CartContext = createContext<CartContextType | undefined>(undefined);

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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        Alert.alert('ত্রুটি', 'কার্ট লোড করতে সমস্যা হয়েছে।');
      }
    };
    
    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Error saving cart:', error);
        Alert.alert('ত্রুটি', 'কার্ট সেভ করতে সমস্যা হয়েছে।');
      }
    };
    
    saveCart();
  }, [cartItems]);

  // Add a product to the cart
  const addToCart = (product: Product) => {
    // Check if the product already exists in the cart
    const existingItemIndex = cartItems.findIndex(item => 
      item.id === product.id &&
      item.category === product.category &&
      item.company === product.company &&
      item.type === product.type &&
      item.color === product.color &&
      item.thickness === product.thickness &&
      item.size === product.size
    );

    if (existingItemIndex !== -1) {
      // If product exists, update its quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += product.quantity || 1;
      setCartItems(updatedItems);
    } else {
      // If product doesn't exist, add it to the cart
      const newItem: CartItem = {
        id: product.id,
        category: product.category,
        company: product.company,
        type: product.type,
        color: product.color,
        thickness: product.thickness,
        size: product.size,
        quantity: product.quantity || 1,
        purchasePrice: product.purchasePrice,
        salePrice: product.salePrice
      };
      
      setCartItems([...cartItems, newItem]);
    }
  };

  // Update the quantity of a cart item
  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    const updatedItems = cartItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    
    setCartItems(updatedItems);
  };

  // Remove an item from the cart
  const removeFromCart = (id: string) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  // Clear the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate the total price of all items in the cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.salePrice * item.quantity), 0);
  };

  // Calculate the total profit of all items in the cart
  const calculateProfit = () => {
    return cartItems.reduce((total, item) => 
      total + ((item.salePrice - item.purchasePrice) * item.quantity), 0
    );
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        calculateTotal,
        calculateProfit
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;