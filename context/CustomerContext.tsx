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
  addCustomer: (customer: CustomerModel) => Promise<CustomerModel>;
  updateCustomer: (customer: CustomerModel) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  getCustomerById: (id: string) => CustomerModel | undefined;
  recordPayment: (customerId: string, paymentData: CreditHistoryItem) => Promise<void>;
  getTopDebtors: () => CustomerModel[];
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
  const addCustomer = useCallback(async (customerData: CustomerModel) => {
    try {
      setCustomers(prevCustomers => [...prevCustomers, customerData]);
      return customerData;
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

  // Record a payment from a customer
  const recordPayment = useCallback(async (customerId: string, paymentData: CreditHistoryItem) => {
    setCustomers(prevCustomers => 
      prevCustomers.map(customer => {
        if (customer.id === customerId) {
          const currentBalance = customer.outstandingBalance || 0;
          const newBalance = Math.max(0, currentBalance - paymentData.amount);
          
          return {
            ...customer,
            outstandingBalance: newBalance,
            creditHistory: [...(customer.creditHistory || []), paymentData]
          };
        }
        return customer;
      })
    );
  }, []);

  // Get top debtors (customers with highest outstanding balance)
  const getTopDebtors = useCallback(() => {
    return [...customers]
      .filter(customer => (customer.outstandingBalance || 0) > 0)
      .sort((a, b) => (b.outstandingBalance || 0) - (a.outstandingBalance || 0))
      .slice(0, 5);
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
    recordPayment,
    getTopDebtors,
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