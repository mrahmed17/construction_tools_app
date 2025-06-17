import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  Product, 
  ProductCategory, 
  DefaultProductCategories, 
  DefaultCompanies, 
  DefaultProductTypes,
  DefaultColorTypes,
  ThicknessRanges,
  SizeRanges
} from '../types';

// Define the context type
interface ProductContextType {
  products: Product[];
  categories: ProductCategory[];
  companies: Record<string, string[]>;
  productTypes: Record<string, string[]>;
  colorTypes: Record<string, string[]>;
  loading: boolean;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  getThicknessOptions: (company: string) => string[];
  getSizeOptions: (category: ProductCategory) => string[];
}

// Create the context
export const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Custom hook to use the product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Product provider component
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories] = useState<ProductCategory[]>(DefaultProductCategories);
  const [companies] = useState<Record<string, string[]>>(DefaultCompanies);
  const [productTypes] = useState<Record<string, string[]>>(DefaultProductTypes);
  const [colorTypes] = useState<Record<string, string[]>>(DefaultColorTypes);
  const [loading, setLoading] = useState(true);

  // Load products from AsyncStorage on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const storedProducts = await AsyncStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } catch (error) {
        console.error('Error loading products:', error);
        Alert.alert('ত্রুটি', 'পণ্য লোড করতে সমস্যা হয়েছে।');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Save products to AsyncStorage whenever they change
  useEffect(() => {
    if (!loading) {
      const saveProducts = async () => {
        try {
          await AsyncStorage.setItem('products', JSON.stringify(products));
        } catch (error) {
          console.error('Error saving products:', error);
          Alert.alert('ত্রুটি', 'পণ্য সেভ করতে সমস্যা হয়েছে।');
        }
      };
      
      saveProducts();
    }
  }, [products, loading]);

  // Add a new product
  const addProduct = async (product: Product) => {
    setProducts(prevProducts => [...prevProducts, product]);
  };

  // Update an existing product
  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
  };

  // Get a product by ID
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };

  // Get products with low stock
  const getLowStockProducts = () => {
    return products.filter(product => product.stock < (product.lowStockAlert || 10));
  };

  // Get thickness options for a company
  const getThicknessOptions = (company: string) => {
    return ThicknessRanges[company] || [];
  };

  // Get size options for a category
  const getSizeOptions = (category: ProductCategory) => {
    return SizeRanges[category] || [];
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        companies,
        productTypes,
        colorTypes,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductById,
        getLowStockProducts,
        getThicknessOptions,
        getSizeOptions
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;