import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CartItem, CartState, Product, Customer, Transaction } from '../types';

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
interface CartContextType {
  items: CartItem[];
  total: number;
  subtotal: number;
  discount: number;
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number) => void;
  customer: Customer | null;
  setCustomer: (customer: Customer | null) => void;
  checkout: (paid: number) => Promise<Transaction | null>;
  transactions: Transaction[];
  loading: boolean;
}

// Create context with default values
const defaultCartContext: CartContextType = {
  items: [],
  total: 0,
  subtotal: 0,
  discount: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  setDiscount: () => {},
  customer: null,
  setCustomer: () => {},
  checkout: async () => null,
  transactions: [],
  loading: false,
};

const CartContext = createContext<CartContextType>(defaultCartContext);

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
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    total: 0,
    discount: 0,
  });
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);

  // Load saved cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const savedCartString = await AsyncStorage.getItem('@cart');
        if (savedCartString) {
          const savedCart = JSON.parse(savedCartString);
          if (isMounted.current) {
            setCartState(savedCart);
          }
        }

        // Load saved transactions
        const savedTransactionsString = await AsyncStorage.getItem('@transactions');
        if (savedTransactionsString) {
          const savedTransactions = JSON.parse(savedTransactionsString);
          if (isMounted.current) {
            setTransactions(savedTransactions);
          }
        }
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        Alert.alert('Error', 'Failed to load cart data');
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadCart();

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('@cart', JSON.stringify(cartState));
      } catch (error) {
        console.error('Error saving cart to storage:', error);
      }
    };

    saveCart();
  }, [cartState]);

  // Calculate subtotal and total when cart items or discount changes
  const subtotal = cartState.items.reduce(
    (sum, item) => sum + item.product.sellingPrice * item.quantity,
    0
  );
  const total = Math.max(0, subtotal - cartState.discount);

  // Add a product to cart
  const addToCart = (product: Product, quantity: number) => {
    setCartState((prevState) => {
      const existingItemIndex = prevState.items.findIndex(
        (item) => item.product.id === product.id
      );

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // If item already exists in cart, update its quantity
        updatedItems = [...prevState.items];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + quantity,
        };
      } else {
        // If item doesn't exist in cart, add it
        const newItem: CartItem = {
          id: product.id,
          product,
          quantity,
        };
        updatedItems = [...prevState.items, newItem];
      }

      return {
        ...prevState,
        items: updatedItems,
      };
    });
  };

  // Remove an item from cart
  const removeFromCart = (id: string) => {
    setCartState((prevState) => ({
      ...prevState,
      items: prevState.items.filter((item) => item.id !== id),
    }));
  };

  // Update an item's quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    setCartState((prevState) => ({
      ...prevState,
      items: prevState.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    }));
  };

  // Clear the cart
  const clearCart = () => {
    setCartState({
      items: [],
      total: 0,
      discount: 0,
    });
    setCustomer(null);
  };

  // Set discount amount
  const setDiscount = (amount: number) => {
    setCartState((prevState) => ({
      ...prevState,
      discount: amount >= 0 ? amount : 0,
    }));
  };

  // Process checkout
  const checkout = async (paid: number): Promise<Transaction | null> => {
    try {
      if (cartState.items.length === 0) {
        Alert.alert('Error', 'Cart is empty');
        return null;
      }

      setLoading(true);

      // Create a new transaction
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        customer: customer,
        items: [...cartState.items],
        subtotal,
        discount: cartState.discount,
        total,
        paid,
        due: total - paid,
      };

      // Update stock levels (in a real app, this would also update the backend)
      for (const item of cartState.items) {
        try {
          // Get current products
          const productsString = await AsyncStorage.getItem('@products');
          if (productsString) {
            const products: Product[] = JSON.parse(productsString);
            
            // Update stock for the purchased product
            const updatedProducts = products.map((product) => {
              if (product.id === item.product.id) {
                return {
                  ...product,
                  stock: Math.max(0, product.stock - item.quantity),
                };
              }
              return product;
            });
            
            // Save updated products
            await AsyncStorage.setItem('@products', JSON.stringify(updatedProducts));
            
            // Flag offline sync needed
            await AsyncStorage.setItem('@offline_pending_sync', 'true');
          }
        } catch (error) {
          console.error('Error updating stock:', error);
        }
      }

      // Save transaction
      const updatedTransactions = [...transactions, newTransaction];
      setTransactions(updatedTransactions);
      await AsyncStorage.setItem('@transactions', JSON.stringify(updatedTransactions));

      // Clear cart after successful checkout
      clearCart();

      // Simulate online sync (would be real in production app)
      try {
        // Store transaction in offline queue if needed
        await AsyncStorage.setItem('@offline_pending_sync', 'true');
        
        // This would be a real API call in production
        // await api.recordTransaction(newTransaction);
      } catch (err) {
        // Store transaction locally if online fails
        console.log('Transaction stored offline, will sync later');
      }

      return newTransaction;
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Checkout Error', 'Failed to process checkout.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    items: cartState.items,
    total,
    subtotal,
    discount: cartState.discount,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setDiscount,
    customer,
    setCustomer,
    checkout,
    transactions,
    loading,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;