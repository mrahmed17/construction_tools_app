import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { 
  Product, 
  Category, 
  Company, 
  ProductType,
  DEFAULT_CATEGORIES,
  DEFAULT_THICKNESSES,
  TIN_SIZES,
  TUA_SIZES
} from '../types';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductsByCategory: (categoryId: string) => Product[];
  getLowStockProducts: () => Product[];
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  addCompany: (categoryId: string, company: Company) => Promise<void>;
  updateCompany: (categoryId: string, company: Company) => Promise<void>;
  deleteCompany: (categoryId: string, companyId: string) => Promise<void>;
  addProductType: (categoryId: string, companyId: string, productType: ProductType) => Promise<void>;
  getThicknessByCompany: (companyName: string) => string[];
  getSizeByCategory: (categoryName: string) => string[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Initialize from AsyncStorage
    const loadData = async () => {
      try {
        // Load products
        const productsData = await AsyncStorage.getItem('products');
        if (productsData) {
          setProducts(JSON.parse(productsData));
        }

        // Load categories
        const categoriesData = await AsyncStorage.getItem('categories');
        if (categoriesData) {
          setCategories(JSON.parse(categoriesData));
        } else {
          // Initialize with default categories
          setCategories(DEFAULT_CATEGORIES);
          await AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
        }
      } catch (error) {
        console.error('Error loading data from storage:', error);
        Alert.alert('ডাটা লোড করতে সমস্যা হচ্ছে', 'অ্যাপ্লিকেশন পুনরায় চালু করুন।');
      }
    };

    loadData();
  }, []);

  // Helper function to save products
  const saveProducts = async (updatedProducts: Product[]) => {
    try {
      await AsyncStorage.setItem('products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    } catch (error) {
      console.error('Error saving products:', error);
      Alert.alert('ডাটা সেভ করতে সমস্যা হচ্ছে', 'অ্যাপ্লিকেশন পুনরায় চালু করুন।');
    }
  };

  // Helper function to save categories
  const saveCategories = async (updatedCategories: Category[]) => {
    try {
      await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error saving categories:', error);
      Alert.alert('ডাটা সেভ করতে সমস্যা হচ্ছে', 'অ্যাপ্লিকেশন পুনরায় চালু করুন।');
    }
  };

  // Product Management Functions
  const addProduct = async (product: Product) => {
    const updatedProducts = [...products, product];
    await saveProducts(updatedProducts);
  };

  const updateProduct = async (product: Product) => {
    const updatedProducts = products.map(p => p.id === product.id ? product : p);
    await saveProducts(updatedProducts);
  };

  const deleteProduct = async (productId: string) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    await saveProducts(updatedProducts);
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter(p => p.categoryId === categoryId);
  };

  const getLowStockProducts = () => {
    return products.filter(p => p.stock <= p.lowStockThreshold);
  };

  // Category Management Functions
  const addCategory = async (category: Category) => {
    const updatedCategories = [...categories, category];
    await saveCategories(updatedCategories);
  };

  const updateCategory = async (category: Category) => {
    const updatedCategories = categories.map(c => 
      c.id === category.id ? category : c
    );
    await saveCategories(updatedCategories);
  };

  const deleteCategory = async (categoryId: string) => {
    // Delete category and all products in the category
    const updatedCategories = categories.filter(c => c.id !== categoryId);
    await saveCategories(updatedCategories);
    
    // Delete products belonging to the category
    const updatedProducts = products.filter(p => p.categoryId !== categoryId);
    await saveProducts(updatedProducts);
  };

  // Company Management Functions
  const addCompany = async (categoryId: string, company: Company) => {
    const updatedCategories = categories.map(c => {
      if (c.id === categoryId) {
        const companies = c.companies ? [...c.companies, company] : [company];
        return { ...c, companies };
      }
      return c;
    });
    
    await saveCategories(updatedCategories);
  };

  const updateCompany = async (categoryId: string, company: Company) => {
    const updatedCategories = categories.map(c => {
      if (c.id === categoryId && c.companies) {
        const updatedCompanies = c.companies.map(comp => 
          comp.id === company.id ? company : comp
        );
        return { ...c, companies: updatedCompanies };
      }
      return c;
    });
    
    await saveCategories(updatedCategories);
  };

  const deleteCompany = async (categoryId: string, companyId: string) => {
    const updatedCategories = categories.map(c => {
      if (c.id === categoryId && c.companies) {
        const updatedCompanies = c.companies.filter(comp => comp.id !== companyId);
        return { ...c, companies: updatedCompanies };
      }
      return c;
    });
    
    await saveCategories(updatedCategories);
    
    // Update products - remove companyId from products
    const updatedProducts = products.map(p => {
      if (p.categoryId === categoryId && p.companyId === companyId) {
        return { ...p, companyId: undefined, companyName: undefined };
      }
      return p;
    });
    
    await saveProducts(updatedProducts);
  };

  // Product Type Management Functions
  const addProductType = async (categoryId: string, companyId: string, productType: ProductType) => {
    const updatedCategories = categories.map(c => {
      if (c.id === categoryId && c.companies) {
        const updatedCompanies = c.companies.map(comp => {
          if (comp.id === companyId) {
            const productTypes = comp.productTypes ? [...comp.productTypes, productType] : [productType];
            return { ...comp, productTypes };
          }
          return comp;
        });
        return { ...c, companies: updatedCompanies };
      }
      return c;
    });
    
    await saveCategories(updatedCategories);
  };

  // Helper functions for getting thicknesses and sizes
  const getThicknessByCompany = (companyName: string) => {
    return DEFAULT_THICKNESSES[companyName] || [];
  };

  const getSizeByCategory = (categoryName: string) => {
    if (categoryName === 'টিন') return TIN_SIZES;
    if (categoryName === 'টুয়া' || categoryName === 'প্লেইন শিট') return TUA_SIZES;
    return [];
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductsByCategory,
        getLowStockProducts,
        addCategory,
        updateCategory,
        deleteCategory,
        addCompany,
        updateCompany,
        deleteCompany,
        addProductType,
        getThicknessByCompany,
        getSizeByCategory
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};

export default ProductContext;