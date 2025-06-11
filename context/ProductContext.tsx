import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Product Category Types
export interface Product {
  id: string;
  category: string;
  company?: string;
  type?: string;
  color?: string;
  thickness: string;
  size: string;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  photoUri?: string;
  lowStockThreshold?: number;
}

export interface Category {
  id: string;
  name: string;
  companies: Company[];
}

export interface Company {
  id: string;
  name: string;
  productTypes: ProductType[];
}

export interface ProductType {
  id: string;
  name: string;
  hasColors: boolean;
  colors?: string[];
  thicknessRange?: {
    min: number;
    max: number;
    step: number;
    unit: string;
  };
  thicknessOptions?: string[];
  sizeRange?: {
    min: number;
    max: number;
    unit: string;
  };
}

// Default Categories based on requirements
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'টিন',
    companies: [
      {
        id: '1',
        name: 'PHP',
        productTypes: [
          {
            id: '1',
            name: 'সুপার',
            hasColors: false,
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          },
          {
            id: '2',
            name: 'লুম',
            hasColors: false,
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          },
          {
            id: '3',
            name: 'কালার',
            hasColors: true,
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          }
        ]
      },
      {
        id: '2',
        name: 'KY',
        productTypes: [
          {
            id: '1',
            name: 'NOF',
            hasColors: false,
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          },
          {
            id: '2',
            name: 'লুম',
            hasColors: false,
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          },
          {
            id: '3',
            name: 'কালার',
            hasColors: true,
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          }
        ]
      },
      {
        id: '3',
        name: 'TK (G)',
        productTypes: [
          {
            id: '1',
            name: 'কালার',
            hasColors: true,
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          }
        ]
      },
      {
        id: '4',
        name: 'ABUL Khair',
        productTypes: [
          {
            id: '1',
            name: 'কালার',
            hasColors: true,
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknessRange: {
              min: 0.12,
              max: 0.46,
              step: 0.01,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          }
        ]
      },
      {
        id: '5',
        name: 'Jalalabad',
        productTypes: [
          {
            id: '1',
            name: 'কালার',
            hasColors: true,
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknessOptions: ['0.25', '0.35', '0.38', '0.42', '0.46', '0.48', '0.52', '0.54', '0.58', '0.62', '0.64', '0.72'],
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          }
        ]
      },
      {
        id: '6',
        name: 'Gelco Steel',
        productTypes: [
          {
            id: '1',
            name: 'কালার',
            hasColors: true,
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknessRange: {
              min: 0.12,
              max: 0.46,
              step: 0.01,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'টুয়া',
    companies: [
      {
        id: '1',
        name: 'PHP',
        productTypes: [
          {
            id: '1',
            name: 'সুপার',
            hasColors: false,
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 10,
              unit: 'ফুট'
            }
          }
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'প্লেইন শিট',
    companies: [
      {
        id: '1',
        name: 'PHP',
        productTypes: [
          {
            id: '1',
            name: 'সুপার',
            hasColors: false,
            thicknessRange: {
              min: 0.120,
              max: 0.510,
              step: 0.010,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 10,
              unit: 'ফুট'
            }
          }
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'ফুলের শিট',
    companies: [],
    productTypes: [
      {
        id: '1',
        name: 'প্রিন্টের শিট',
        hasColors: true,
        colors: ['ফুল প্যাটার্ন ১', 'ফুল প্যাটার্ন ২', 'ফুল প্যাটার্ন ৩'],
        thicknessRange: {
          min: 0.120,
          max: 0.510,
          step: 0.010,
          unit: 'মিমি'
        },
        sizeRange: {
          min: 6,
          max: 10,
          unit: 'ফুট'
        }
      }
    ]
  },
  {
    id: '5',
    name: 'প্লাস্টিকের টিন',
    companies: [
      {
        id: '1',
        name: 'RFL',
        productTypes: [
          {
            id: '1',
            name: 'প্লাস্টিক টিন',
            hasColors: true,
            colors: ['সাদা', 'লাল', 'নীল'],
            thicknessRange: {
              min: 0.75,
              max: 1.75,
              step: 0.25,
              unit: 'মিমি'
            },
            sizeRange: {
              min: 6,
              max: 12,
              unit: 'ফুট'
            }
          }
        ]
      }
    ]
  }
];

export interface ProductContextType {
  categories: Category[];
  products: Product[];
  addCategory: (name: string) => void;
  addCompany: (categoryId: string, companyName: string) => void;
  addProductType: (categoryId: string, companyId: string, productType: Partial<ProductType>) => void;
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  saveProductImage: (productId: string, imageUri: string) => Promise<void>;
  getLowStockProducts: () => Product[];
  loading: boolean;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load categories
        const storedCategories = await AsyncStorage.getItem('categories');
        if (storedCategories) {
          setCategories(JSON.parse(storedCategories));
        } else {
          // Set default categories if none exist
          setCategories(DEFAULT_CATEGORIES);
          await AsyncStorage.setItem('categories', JSON.stringify(DEFAULT_CATEGORIES));
        }
        
        // Load products
        const storedProducts = await AsyncStorage.getItem('products');
        if (storedProducts) {
          setProducts(JSON.parse(storedProducts));
        }
      } catch (error) {
        console.error('Error loading data:', error);
        Alert.alert('ত্রুটি', 'ডাটা লোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
        
        // Set default values in case of error
        setCategories(DEFAULT_CATEGORIES);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Save categories to AsyncStorage whenever they change
  useEffect(() => {
    const saveCategories = async () => {
      try {
        if (categories && categories.length > 0) {
          await AsyncStorage.setItem('categories', JSON.stringify(categories));
        }
      } catch (error) {
        console.error('Error saving categories:', error);
        Alert.alert('ত্রুটি', 'ক্যাটাগরি সেভ করতে সমস্যা হয়েছে।');
      }
    };
    
    if (!loading && categories.length > 0) {
      saveCategories();
    }
  }, [categories, loading]);
  
  // Save products to AsyncStorage whenever they change
  useEffect(() => {
    const saveProducts = async () => {
      try {
        await AsyncStorage.setItem('products', JSON.stringify(products));
      } catch (error) {
        console.error('Error saving products:', error);
        Alert.alert('ত্রুটি', 'পণ্য সেভ করতে সমস্যা হয়েছে।');
      }
    };
    
    if (!loading) {
      saveProducts();
    }
  }, [products, loading]);

  const addCategory = (name: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      companies: []
    };
    
    setCategories(prevCategories => [...prevCategories, newCategory]);
  };

  const addCompany = (categoryId: string, companyName: string) => {
    const newCompany: Company = {
      id: Date.now().toString(),
      name: companyName,
      productTypes: []
    };
    
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? { ...category, companies: [...category.companies, newCompany] } 
          : category
      )
    );
  };

  const addProductType = (categoryId: string, companyId: string, productType: Partial<ProductType>) => {
    const newProductType: ProductType = {
      id: Date.now().toString(),
      name: productType.name || 'নতুন প্রোডাক্ট',
      hasColors: productType.hasColors || false,
      colors: productType.colors || [],
      thicknessRange: productType.thicknessRange,
      thicknessOptions: productType.thicknessOptions,
      sizeRange: productType.sizeRange
    };
    
    setCategories(prevCategories => 
      prevCategories.map(category => 
        category.id === categoryId 
          ? {
              ...category,
              companies: category.companies.map(company => 
                company.id === companyId 
                  ? { ...company, productTypes: [...company.productTypes, newProductType] } 
                  : company
              )
            } 
          : category
      )
    );
  };

  const addProduct = (product: Partial<Product>) => {
    const newProduct: Product = {
      id: Date.now().toString(),
      category: product.category || '',
      company: product.company,
      type: product.type,
      color: product.color,
      thickness: product.thickness || '',
      size: product.size || '',
      purchasePrice: product.purchasePrice || 0,
      salePrice: product.salePrice || 0,
      stock: product.stock || 0,
      photoUri: product.photoUri,
      lowStockThreshold: product.lowStockThreshold || 5
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { ...product, ...updates } : product
      )
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
  };

  const saveProductImage = async (productId: string, imageUri: string) => {
    // Update product with image URI
    updateProduct(productId, { photoUri: imageUri });
    
    // In a real app with Firebase Storage, you would upload the image here
    // For now, we'll just store the URI in AsyncStorage via the products update
  };

  const getLowStockProducts = () => {
    return products.filter(product => 
      product.stock <= (product.lowStockThreshold || 5)
    );
  };

  return (
    <ProductContext.Provider 
      value={{
        categories,
        products,
        addCategory,
        addCompany,
        addProductType,
        addProduct,
        updateProduct,
        deleteProduct,
        saveProductImage,
        getLowStockProducts,
        loading
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export default ProductProvider;