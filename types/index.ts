// Product category types
export type CompanyType = {
  id: string;
  name: string;
  productTypes: ProductType[];
  thicknessOptions: string[];
  sizeOptions: string[];
};

export type ProductType = {
  id: string;
  name: string;
  hasColors: boolean;
  colors?: string[];
};

export type ProductCategory = {
  id: string;
  name: string;
  companies: CompanyType[] | null;
  hasPrints?: boolean;
  printTypes?: string[];
  isCountedByPiece?: boolean;
  hasThickness: boolean;
  hasSize: boolean;
  defaultThicknessOptions?: string[];
  defaultSizeOptions?: string[];
};

// Supplier type
export type Supplier = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes?: string;
};

// Stock item
export type StockItem = {
  id: string;
  category: string;
  company?: string;
  productType: string;
  color?: string;
  size?: string;
  thickness?: string;
  currentStock: number;
  lowStockThreshold: number;
  purchasePrice: number;
  sellingPrice: number;
};

// Stock transaction
export type StockTransaction = {
  id: string;
  itemId: string;
  type: 'in' | 'out';
  quantity: number;
  date: Date;
  supplierId?: string;
  notes?: string;
};

// Customer
export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
};

// Invoice
export type Invoice = {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: {
    id: string;
    category: string;
    company?: string;
    productType: string;
    color?: string;
    size?: string;
    thickness?: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    profit: number;
  }[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  totalProfit: number;
  date: Date;
  paidAmount: number;
  dueAmount: number;
  notes?: string;
};

// Mock data for product categories
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  {
    id: 'tin',
    name: 'টিন',
    hasThickness: true,
    hasSize: true,
    defaultSizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট'],
    companies: [
      {
        id: 'php',
        name: 'PHP',
        productTypes: [
          { id: 'super', name: 'সুপার', hasColors: false },
          { id: 'lum', name: 'লুম', hasColors: false },
          { 
            id: 'color', 
            name: 'কালার', 
            hasColors: true, 
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু কালার', 'রেড'] 
          }
        ],
        thicknessOptions: [
          '০.১২০', '০.১৩০', '০.১৪০', '০.১৫০', '০.১৬০', '০.১৭০', '০.১৮০', '০.১৯০', 
          '০.২০০', '০.২১০', '০.২২০', '০.২৩০', '০.২৪০', '০.২৫০', '০.২৬০', '০.২৭০',
          '০.২৮০', '০.২৯০', '০.৩০০', '০.৩১০', '০.৩২০', '০.৩৩০', '০.৩৪০', '০.৩৫০',
          '০.৩৬০', '০.৩৭০', '০.৩৮০', '০.৩৯০', '০.৪০০', '০.৪১০', '০.৪২০', '০.৪৩০',
          '০.৪৪০', '০.৪৫০', '০.৪৬০', '০.৪৭০', '০.৪৮০', '০.৪৯০', '০.৫০০', '০.৫১০'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      },
      {
        id: 'ky',
        name: 'KY',
        productTypes: [
          { id: 'nof', name: 'NOF', hasColors: false },
          { id: 'lum', name: 'লুম', hasColors: false },
          { 
            id: 'color', 
            name: 'কালার', 
            hasColors: true, 
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু কালার', 'রেড'] 
          }
        ],
        thicknessOptions: [
          '০.১২০', '০.১৩০', '০.১৪০', '০.১৫০', '০.১৬০', '০.১৭০', '০.১৮০', '০.১৯০', 
          '০.২০০', '০.২১০', '০.২২০', '০.২৩০', '০.২৪০', '০.২৫০', '০.২৬০', '০.২৭০',
          '০.২৮০', '০.২৯০', '০.৩০০', '০.৩১০', '০.৩২০', '০.৩৩০', '০.৩৪০', '০.৩৫০',
          '০.৩৬০', '০.৩৭০', '০.৩৮০', '০.৩৯০', '০.৪০০', '০.৪১০', '০.৪২০', '০.৪৩০',
          '০.৪৪০', '০.৪৫০', '০.৪৬০', '০.৪৭০', '০.৪৮০', '০.৪৯০', '০.৫০০', '০.৫১০'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      },
      {
        id: 'tkg',
        name: 'TK(G)',
        productTypes: [
          { id: 'standard', name: 'স্ট্যান্ডার্ড', hasColors: false }
        ],
        thicknessOptions: [
          '০.১২০', '০.১৩০', '০.১৪০', '০.১৫০', '০.১৬০', '০.১৭০', '০.১৮০', '০.১৯০', 
          '০.২০০', '০.২১০', '০.২২০', '০.২৩০', '০.২৪০', '০.২৫০', '০.২৬০', '০.২৭০',
          '০.২৮০', '০.২৯০', '০.৩০০', '০.৩১০', '০.৩২০', '০.৩৩০', '০.৩৪০', '০.৩৫০',
          '০.৩৬০', '০.৩৭০', '০.৩৮০', '০.৩৯০', '০.৪০০', '০.৪১০', '০.৪২০', '০.৪৩০',
          '০.৪৪০', '০.৪৫০', '০.৪৬০', '০.৪৭০', '০.৪৮০', '০.৪৯০', '০.৫০০', '০.৫১০'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      },
      {
        id: 'abulkhair',
        name: 'ABUL Khair',
        productTypes: [
          { id: 'standard', name: 'স্ট্যান্ডার্ড', hasColors: false }
        ],
        thicknessOptions: [
          '০.১২০', '০.১৩০', '০.১৪০', '০.১৫০', '০.১৬০', '০.১৭০', '০.১৮০', '০.১৯০', 
          '০.২০০', '০.২১০', '০.২২০', '০.২৩০', '০.২৪০', '০.২৫০', '০.২৬০', '০.২৭০',
          '০.২৮০', '০.২৯০', '০.৩০০', '০.৩১০', '০.৩২০', '০.৩৩০', '০.৩৪০', '০.৩৫০',
          '০.৩৬০', '০.৩৭০', '০.৩৮০', '০.৩৯০', '০.৪০০', '০.৪১০', '০.৪২০', '০.৪৩০',
          '০.৪৪০', '০.৪৫০', '০.৪৬০'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      },
      {
        id: 'jalalabad',
        name: 'Jalalabad',
        productTypes: [
          { id: 'standard', name: 'স্ট্যান্ডার্ড', hasColors: false }
        ],
        thicknessOptions: [
          '০.২৫', '০.৩৫', '০.৩৮', '০.৪২', '০.৪৬', '০.৪৮', 
          '০.৫২', '০.৫৪', '০.৫৮', '০.৬২', '০.৬৪', '০.৭২'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      },
      {
        id: 'gelcosteel',
        name: 'Gelco Steel',
        productTypes: [
          { id: 'standard', name: 'স্ট্যান্ডার্ড', hasColors: false }
        ],
        thicknessOptions: [
          '০.১২০', '০.১৩০', '০.১৪০', '০.১৫০', '০.১৬০', '০.১৭০', '০.১৮০', '০.১৯০', 
          '০.২০০', '০.২১০', '০.২২০', '০.২৩০', '০.২৪০', '০.২৫০', '০.২৬০', '০.২৭০',
          '০.২৮০', '০.২৯০', '০.৩০০', '০.৩১০', '০.৩২০', '০.৩৩০', '০.৩৪০', '০.৩৫০',
          '০.৩৬০', '০.৩৭০', '০.৩৮০', '০.৩৯০', '০.৪০০', '০.৪১০', '০.৪২০', '০.৪৩০',
          '০.৪৪০', '০.৪৫০', '০.৪৬০'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      }
    ],
  },
  {
    id: 'tuya',
    name: 'টুয়া',
    hasThickness: true,
    hasSize: true,
    defaultSizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট'],
    companies: [
      {
        id: 'php',
        name: 'PHP',
        productTypes: [
          { id: 'super', name: 'সুপার', hasColors: false },
          { id: 'lum', name: 'লুম', hasColors: false },
          { 
            id: 'color', 
            name: 'কালার', 
            hasColors: true, 
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু কালার', 'রেড'] 
          }
        ],
        thicknessOptions: [
          '০.১২০', '০.১৩০', '০.১৪০', '০.১৫০', '০.১৬০', '০.১৭০', '০.১৮০', '০.১৯০', 
          '০.২০০', '০.২১০', '০.২২০', '০.২৩০', '০.২৪০', '০.২৫০', '০.২৬০', '০.২৭০',
          '০.২৮০', '০.২৯০', '০.৩০০', '০.৩১০', '০.৩২০', '০.৩৩০', '০.৩৪০', '০.৩৫০',
          '০.৩৬০', '০.৩৭০', '০.৩৮০', '০.৩৯০', '০.৪০০', '০.৪১০', '০.৪২০', '০.৪৩০',
          '০.৪৪০', '০.৪৫০', '০.৪৬০', '০.৪৭০', '০.৪৮০', '০.৪৯০', '০.৫০০', '০.৫১০'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট']
      },
      // Similar structure for other companies
    ],
  },
  {
    id: 'plainsheet',
    name: 'প্লেইন শিট',
    hasThickness: true,
    hasSize: true,
    defaultSizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট'],
    companies: [
      // Same as Tuya
    ],
  },
  {
    id: 'flowersheet',
    name: 'ফুলের শিট',
    hasThickness: true,
    hasSize: true,
    defaultSizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট'],
    hasPrints: true,
    printTypes: ['টাইপ ১', 'টাইপ ২', 'টাইপ ৩'],
    companies: null,
  },
  {
    id: 'plastictinsheet',
    name: 'প্লাস্টিকের টিন',
    hasThickness: true,
    hasSize: true,
    defaultSizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট'],
    companies: [
      {
        id: 'rfl',
        name: 'RFL',
        productTypes: [
          { id: 'standard', name: 'স্ট্যান্ডার্ড', hasColors: false }
        ],
        thicknessOptions: [
          '০.৭৫', '১.০০', '১.২৫', '১.৫০', '১.৭৫'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      }
    ],
  },
  {
    id: 'flowerdeutin',
    name: 'ফুলের ঢেউটিন',
    hasThickness: true,
    hasSize: true,
    defaultSizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট'],
    companies: [
      {
        id: 'php',
        name: 'PHP',
        productTypes: [
          { id: 'standard', name: 'স্ট্যান্ডার্ড', hasColors: false }
        ],
        thicknessOptions: [
          '০.১২০', '০.১৩০', '০.১৪০', '০.১৫০', '০.১৬০', '০.১৭০', '০.১৮০', '০.১৯০', 
          '০.২০০', '০.২১০', '০.২২০', '০.২৩০', '০.২৪০', '০.২৫০', '০.২৬০', '০.২৭০',
          '০.২৮০', '০.২৯০', '০.৩০০', '০.৩১০', '০.৩২০', '০.৩৩০', '০.৩৪০', '০.৩৫০',
          '০.৩৬০', '০.৩৭০', '০.৩৮০', '০.৩৯০', '০.৪০০', '০.৪১০', '০.৪২০', '০.৪৩০',
          '০.৪৪০', '০.৪৫০', '০.৪৬০', '০.৪৭০', '০.৪৮০', '০.৪৯০', '০.৫০০', '০.৫১০'
        ],
        sizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট']
      }
    ],
  },
  {
    id: 'chachplastic',
    name: 'চাচের প্লাস্টিক (সেলু লাইট)',
    hasThickness: true,
    hasSize: true,
    defaultSizeOptions: ['৬ ফুট', '৭ ফুট', '৮ ফুট', '৯ ফুট', '১০ ফুট', '১১ ফুট', '১২ ফুট'],
    companies: null,
  },
  {
    id: 'chachdigital',
    name: 'চাচ ডিজিটাল',
    hasThickness: false,
    hasSize: false,
    isCountedByPiece: true,
    companies: null,
  },
  {
    id: 'deepchach',
    name: 'ডিপ চাচ',
    hasThickness: false,
    hasSize: false,
    isCountedByPiece: true,
    companies: null,
  },
  {
    id: 'coil',
    name: 'কয়েল (পি-ফোম)',
    hasThickness: true,
    hasSize: false,
    companies: null,
    defaultThicknessOptions: [
      '৪', '৫', '৬', '৭', '৮', '৯', '১০', '১১', '১২'
    ]
  },
  {
    id: 'aluminum',
    name: 'অ্যালুমিনিয়াম',
    hasThickness: false,
    hasSize: false,
    companies: null,
    productTypes: [
      { id: 'a-grade', name: 'এ-গ্রেড', hasColors: false },
      { id: 'b-grade', name: 'বি-গ্রেড', hasColors: false }
    ]
  },
  {
    id: 'jhalat',
    name: 'ঝালট',
    hasThickness: false,
    hasSize: false,
    isCountedByPiece: true,
    companies: null,
  }
];