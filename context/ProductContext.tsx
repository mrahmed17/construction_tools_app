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
  addProduct: (product: Partial<Product>) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => Product | undefined;
  getLowStockProducts: () => Product[];
  getThicknessOptions: (company: string) => string[];
  getSizeOptions: (category: ProductCategory) => string[];
  addCategory: (name: string) => void;
  addCompany: (categoryId: string, name: string) => void;
  addProductType: (categoryId: string, companyId: string, productTypeData: Partial<any>) => void;
  saveProductImage: (uri: string) => Promise<string>;
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

// Generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Product provider component
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>(DefaultProductCategories);
  const [companies, setCompanies] = useState<Record<string, string[]>>(DefaultCompanies);
  const [productTypes, setProductTypes] = useState<Record<string, string[]>>(DefaultProductTypes);
  const [colorTypes, setColorTypes] = useState<Record<string, string[]>>(DefaultColorTypes);
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

  // Add a new category
  const addCategory = (name: string) => {
    // Check if category already exists
    if (categories.includes(name as ProductCategory)) {
      Alert.alert('ত্রুটি', 'এই ক্যাটাগরি ইতিমধ্যে বিদ্যমান।');
      return;
    }
    
    const newCategories = [...categories, name as ProductCategory];
    setCategories(newCategories);
    
    // Update AsyncStorage
    AsyncStorage.setItem('categories', JSON.stringify(newCategories))
      .catch(error => {
        console.error('Error saving categories:', error);
        Alert.alert('ত্রুটি', 'ক্যাটাগরি সেভ করতে সমস্যা হয়েছে।');
      });
  };

  // Add a new company to a category
  const addCompany = (categoryId: string, name: string) => {
    const category = categoryId as ProductCategory;
    
    // Check if company already exists for this category
    if (companies[category] && companies[category].includes(name)) {
      Alert.alert('ত্রুটি', 'এই কোম্পানি ইতিমধ্যে বিদ্যমান।');
      return;
    }
    
    const updatedCompanies = {
      ...companies,
      [category]: [...(companies[category] || []), name]
    };
    
    setCompanies(updatedCompanies);
    
    // Update AsyncStorage
    AsyncStorage.setItem('companies', JSON.stringify(updatedCompanies))
      .catch(error => {
        console.error('Error saving companies:', error);
        Alert.alert('ত্রুটি', 'কোম্পানি সেভ করতে সমস্যা হয়েছে।');
      });
  };

  // Add a new product type
  const addProductType = (categoryId: string, companyId: string, productTypeData: Partial<any>) => {
    const updatedProductTypes = {
      ...productTypes,
      [companyId]: [...(productTypes[companyId] || []), productTypeData.name]
    };
    
    setProductTypes(updatedProductTypes);
    
    // Update AsyncStorage
    AsyncStorage.setItem('productTypes', JSON.stringify(updatedProductTypes))
      .catch(error => {
        console.error('Error saving product types:', error);
        Alert.alert('ত্রুটি', 'প্রোডাক্ট টাইপ সেভ করতে সমস্যা হয়েছে।');
      });
    
    // If product type has colors, update color types
    if (productTypeData.hasColors) {
      const updatedColorTypes = {
        ...colorTypes,
        [productTypeData.name]: colorTypes['কালার'] || ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড']
      };
      
      setColorTypes(updatedColorTypes);
      
      // Update AsyncStorage
      AsyncStorage.setItem('colorTypes', JSON.stringify(updatedColorTypes))
        .catch(error => {
          console.error('Error saving color types:', error);
          Alert.alert('ত্রুটি', 'কালার টাইপ সেভ করতে সমস্যা হয়েছে।');
        });
    }
  };

  // Add a new product
  const addProduct = async (productData: Partial<Product>) => {
    const newProduct: Product = {
      id: generateId(),
      category: productData.category || 'টিন',
      company: productData.company,
      type: productData.type,
      color: productData.color,
      thickness: productData.thickness,
      size: productData.size,
      grade: productData.grade,
      print: productData.print,
      purchasePrice: productData.purchasePrice || 0,
      sellingPrice: productData.sellingPrice || 0,
      stock: productData.stock || 0,
      lowStockAlert: productData.lowStockAlert || 5,
      image: productData.image,
      supplier: productData.supplier,
      lastUpdated: new Date().toISOString()
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    return Promise.resolve();
  };

  // Update an existing product
  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === updatedProduct.id ? updatedProduct : product
      )
    );
    return Promise.resolve();
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    return Promise.resolve();
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

  // Save product image
  const saveProductImage = async (uri: string) => {
    // In a real app, this would upload to a server or Firebase Storage
    // For now, we'll just return the URI
    return Promise.resolve(uri);
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
        getSizeOptions,
        addCategory,
        addCompany,
        addProductType,
        saveProductImage
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;