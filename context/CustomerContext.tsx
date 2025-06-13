import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CustomerModel, CreditHistoryItem } from '../types';
import { generateUniqueId } from '../utils/helpers';

// Define the context type
interface CustomerContextType {
  customers: CustomerModel[];
  loading: boolean;
  error: string | null;
  addCustomer: (customer: Omit<CustomerModel, 'id' | 'totalPurchases' | 'history'>) => Promise<CustomerModel>;
  updateCustomer: (customer: CustomerModel) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => CustomerModel | undefined;
  addCredit: (customerId: string, amount: number, dueDate?: number, notes?: string) => Promise<void>;
  recordPayment: (customerId: string, amount: number, notes?: string) => Promise<void>;
  getTopDebtors: () => CustomerModel[];
  getUpcomingDues: (daysThreshold: number) => CreditHistoryItem[];
}

// Create the context
const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Create a provider component
export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load customers from AsyncStorage
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('customers');
        if (jsonValue !== null) {
          setCustomers(JSON.parse(jsonValue));
        }
      } catch (e) {
        setError('Failed to load customers: ' + e.message);
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  // Save customers to AsyncStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      const saveCustomers = async () => {
        try {
          const jsonValue = JSON.stringify(customers);
          await AsyncStorage.setItem('customers', jsonValue);
        } catch (e) {
          setError('Failed to save customers: ' + e.message);
        }
      };

      saveCustomers();
    }
  }, [customers, loading]);

  // Add a new customer
  const addCustomer = useCallback(async (customerData: Omit<CustomerModel, 'id' | 'totalPurchases' | 'history'>) => {
    try {
      const newCustomer: CustomerModel = {
        ...customerData,
        id: generateUniqueId(),
        totalPurchases: 0,
        outstandingCredit: 0,
        history: [],
      };
      
      setCustomers(prevCustomers => [...prevCustomers, newCustomer]);
      return newCustomer;
    } catch (e) {
      setError('Failed to add customer: ' + e.message);
      throw new Error('Failed to add customer');
    }
  }, []);

  // Update an existing customer
  const updateCustomer = useCallback(async (updatedCustomer: CustomerModel) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => 
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  }, []);

  // Delete a customer
  const deleteCustomer = useCallback(async (id: string) => {
    setCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== id));
  }, []);

  // Get a customer by ID
  const getCustomerById = useCallback((id: string) => {
    return customers.find(customer => customer.id === id);
  }, [customers]);

  // Add credit (from a purchase) to a customer account
  const addCredit = useCallback(async (customerId: string, amount: number, dueDate?: number, notes?: string) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => {
        if (customer.id === customerId) {
          const creditRecord: CreditHistoryItem = {
            id: generateUniqueId(),
            date: Date.now(),
            amount,
            type: 'purchase',
            notes,
            dueDate,
          };
          
          return {
            ...customer,
            outstandingCredit: customer.outstandingCredit + amount,
            history: [...customer.history, creditRecord],
            totalPurchases: customer.totalPurchases + 1,
            lastPurchaseDate: Date.now()
          };
        }
        return customer;
      })
    );
  }, []);

  // Record a payment from a customer
  const recordPayment = useCallback(async (customerId: string, amount: number, notes?: string) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => {
        if (customer.id === customerId) {
          const paymentRecord: CreditHistoryItem = {
            id: generateUniqueId(),
            date: Date.now(),
            amount,
            type: 'payment',
            notes,
          };
          
          return {
            ...customer,
            outstandingCredit: Math.max(0, customer.outstandingCredit - amount),
            history: [...customer.history, paymentRecord]
          };
        }
        return customer;
      })
    );
  }, []);

  // Get top debtors (customers with highest outstanding credit)
  const getTopDebtors = useCallback(() => {
    return [...customers]
      .filter(customer => customer.outstandingCredit > 0)
      .sort((a, b) => b.outstandingCredit - a.outstandingCredit)
      .slice(0, 5);
  }, [customers]);

  // Get upcoming due payments
  const getUpcomingDues = useCallback((daysThreshold: number) => {
    const now = Date.now();
    const thresholdTime = now + (daysThreshold * 24 * 60 * 60 * 1000);
    
    return customers
      .flatMap(customer => 
        customer.history
          .filter(item => 
            item.type === 'purchase' && 
            item.dueDate && 
            item.dueDate > now && 
            item.dueDate <= thresholdTime
          )
          .map(item => ({
            ...item,
            customerName: customer.name,
            customerPhone: customer.phone
          }))
      )
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
  }, [customers]);

  // Context value
  const value = {
    customers,
    loading,
    error,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    addCredit,
    recordPayment,
    getTopDebtors,
    getUpcomingDues,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
};

// Create a custom hook to use the context
export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};