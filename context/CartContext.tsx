import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CartItem, Product, Order } from '../types';

// Define cart context type
interface CartContextType {
  cartItems: CartItem[];
  orders: Order[];
  loading: boolean;
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  calculateTotal: () => number;
  calculateProfit: () => number;
  createOrder: (orderData: Omit<Order, 'id'>) => Promise<Order>;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load cart and orders from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const savedCart = await AsyncStorage.getItem('cart');
        const savedOrders = await AsyncStorage.getItem('orders');
        
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        
        if (savedOrders) {
          setOrders(JSON.parse(savedOrders));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('ত্রুটি', 'ডাটা লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      const saveCart = async () => {
        try {
          await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
        } catch (error) {
          console.error('Error saving cart:', error);
          Alert.alert('ত্রুটি', 'কার্ট সেভ করতে সমস্যা হয়েছে।');
        }
      };
      
      saveCart();
    }
  }, [cartItems, loading]);

  // Save orders to AsyncStorage whenever they change
  useEffect(() => {
    if (!loading) {
      const saveOrders = async () => {
        try {
          await AsyncStorage.setItem('orders', JSON.stringify(orders));
        } catch (error) {
          console.error('Error saving orders:', error);
          Alert.alert('ত্রুটি', 'অর্ডার সেভ করতে সমস্যা হয়েছে।');
        }
      };
      
      saveOrders();
    }
  }, [orders, loading]);

  // Add an item to the cart
  const addToCart = (item: CartItem) => {
    // Check if the product already exists in the cart
    const existingItemIndex = cartItems.findIndex(cartItem => 
      cartItem.productId === item.productId
    );

    if (existingItemIndex !== -1) {
      // If product exists, update its quantity
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].quantity += item.quantity;
      setCartItems(updatedItems);
    } else {
      // If product doesn't exist, add it to the cart
      setCartItems([...cartItems, item]);
    }
  };

  // Update the quantity of a cart item
  const updateCartItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const updatedItems = cartItems.map(item => 
      item.productId === productId ? { ...item, quantity } : item
    );
    
    setCartItems(updatedItems);
  };

  // Remove an item from the cart
  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  // Clear the cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate the total price of all items in the cart
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const itemTotal = item.totalPrice || (item.product.sellingPrice * item.quantity);
      return total + itemTotal;
    }, 0);
  };

  // Calculate the total profit of all items in the cart
  const calculateProfit = () => {
    return cartItems.reduce((total, item) => {
      const itemProfit = item.profit || 
        ((item.product.sellingPrice - item.product.purchasePrice) * item.quantity);
      return total + itemProfit;
    }, 0);
  };

  // Create a new order
  const createOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
    };
    
    setOrders(prevOrders => [...prevOrders, newOrder]);
    clearCart();
    
    return newOrder;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        orders,
        loading,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        calculateTotal,
        calculateProfit,
        createOrder
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;