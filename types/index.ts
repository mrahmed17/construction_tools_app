// Product category types
export interface ProductType {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  companyName?: string;
  productType?: string;
  color?: string;
  thickness?: string;
  size?: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  lowStockThreshold: number;
  imageUri?: string;
  unit: 'pieces' | 'feet' | 'meter';
  createdAt: number;
  supplierId?: string;
}

export interface SupplierType {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  unpaidAmount: number;
  lastPurchaseDate?: number;
  notes?: string;
}

export interface CartItemType {
  product: ProductType;
  quantity: number;
}

export interface SaleType {
  id: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  items: CartItemType[];
  totalAmount: number;
  discount: number;
  amountPaid: number;
  amountDue: number;
  saleDate: number;
  createdBy: string;
}

// Product category structure
export interface CategoryStructure {
  id: string;
  name: string;
  companies?: Company[];
}

export interface Company {
  id: string;
  name: string;
  productTypes: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  name: string;
  colors?: string[];
  thicknesses?: string[];
  sizes?: string[];
}

// Define all our product categories
export const PRODUCT_CATEGORIES: CategoryStructure[] = [
  {
    id: 'tin',
    name: 'টিন',
    companies: [
      {
        id: 'php',
        name: 'PHP',
        productTypes: [
          { id: 'super', name: 'সুপার', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { id: 'loom', name: 'লুম', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { 
            id: 'color', 
            name: 'কালার',
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknesses: generateThicknesses(0.120, 0.510, 0.010)
          }
        ]
      },
      {
        id: 'ky',
        name: 'KY',
        productTypes: [
          { id: 'nof', name: 'NOF', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { id: 'loom', name: 'লুম', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { 
            id: 'color', 
            name: 'কালার',
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknesses: generateThicknesses(0.120, 0.510, 0.010)
          }
        ]
      },
      {
        id: 'tkg',
        name: 'TK (G)',
        productTypes: [
          { id: 'super', name: 'সুপার', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { id: 'loom', name: 'লুম', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { 
            id: 'color', 
            name: 'কালার',
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknesses: generateThicknesses(0.120, 0.510, 0.010)
          }
        ]
      },
      {
        id: 'abulkhair',
        name: 'ABUL Khair',
        productTypes: [
          { id: 'super', name: 'সুপার', thicknesses: generateThicknesses(0.120, 0.460, 0.010) },
          { id: 'loom', name: 'লুম', thicknesses: generateThicknesses(0.120, 0.460, 0.010) },
          { 
            id: 'color', 
            name: 'কালার',
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknesses: generateThicknesses(0.120, 0.460, 0.010)
          }
        ]
      },
      {
        id: 'jalalabad',
        name: 'Jalalabad',
        productTypes: [
          { 
            id: 'super', 
            name: 'সুপার', 
            thicknesses: ['0.25', '0.35', '0.38', '0.42', '0.46', '0.48', '0.52', '0.54', '0.58', '0.62', '0.64', '0.72']
          },
          { 
            id: 'loom', 
            name: 'লুম', 
            thicknesses: ['0.25', '0.35', '0.38', '0.42', '0.46', '0.48', '0.52', '0.54', '0.58', '0.62', '0.64', '0.72'] 
          },
          { 
            id: 'color', 
            name: 'কালার',
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknesses: ['0.25', '0.35', '0.38', '0.42', '0.46', '0.48', '0.52', '0.54', '0.58', '0.62', '0.64', '0.72']
          }
        ]
      },
      {
        id: 'gelcosteel',
        name: 'Gelco Steel',
        productTypes: [
          { id: 'super', name: 'সুপার', thicknesses: generateThicknesses(0.120, 0.460, 0.010) },
          { id: 'loom', name: 'লুম', thicknesses: generateThicknesses(0.120, 0.460, 0.010) },
          { 
            id: 'color', 
            name: 'কালার',
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknesses: generateThicknesses(0.120, 0.460, 0.010)
          }
        ]
      }
    ]
  },
  {
    id: 'tuya',
    name: 'টুয়া',
    companies: [
      {
        id: 'php',
        name: 'PHP',
        productTypes: [
          { id: 'super', name: 'সুপার', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { id: 'loom', name: 'লুম', thicknesses: generateThicknesses(0.120, 0.510, 0.010) },
          { 
            id: 'color', 
            name: 'কালার',
            colors: ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
            thicknesses: generateThicknesses(0.120, 0.510, 0.010)
          }
        ]
      },
      // Other companies similar to Tin but with different size range (6-10 feet)
    ]
  },
  {
    id: 'plainsheet',
    name: 'প্লেইন শিট',
    // Same structure as tuya
  },
  {
    id: 'flowersheet',
    name: 'ফুলের শিট',
    // No companies, but has print types instead
    companies: [
      {
        id: 'print',
        name: 'প্রিন্ট টাইপ',
        productTypes: [
          { id: 'flower1', name: 'ফুল প্যাটার্ন ১' },
          { id: 'flower2', name: 'ফুল প্যাটার্ন ২' },
          { id: 'flower3', name: 'ফুল প্যাটার্ন ৩' }
        ]
      }
    ]
  },
  {
    id: 'plastictin',
    name: 'প্লাস্টিকের টিন',
    companies: [
      {
        id: 'rfl',
        name: 'RFL',
        productTypes: [
          { 
            id: 'plastic', 
            name: 'প্লাস্টিক টিন',
            thicknesses: generateThicknesses(0.75, 1.75, 0.25)
          }
        ]
      }
    ]
  },
  {
    id: 'flowerwavetin',
    name: 'ফুলের ঢেউটিন',
    companies: [
      {
        id: 'php',
        name: 'PHP',
        productTypes: [
          { id: 'flowerwave', name: 'ফুলের ঢেউটিন', thicknesses: generateThicknesses(0.120, 0.510, 0.010) }
        ]
      }
    ]
  },
  {
    id: 'chachplastic',
    name: 'চাচের প্লাস্টিক (সেলু লাইট)',
    // No companies
    companies: [
      {
        id: 'generic',
        name: 'জেনেরিক',
        productTypes: [
          { id: 'chach', name: 'চাচের প্লাস্টিক' }
        ]
      }
    ]
  },
  {
    id: 'chachdigital',
    name: 'চাচ ডিজিটাল',
    // Sold by piece, no company, no size
    companies: [
      {
        id: 'generic',
        name: 'জেনেরিক',
        productTypes: [
          { id: 'chachdigital', name: 'চাচ ডিজিটাল' }
        ]
      }
    ]
  },
  {
    id: 'deepchach',
    name: 'ডিপ চাচ',
    // Sold by piece, no company, no size
    companies: [
      {
        id: 'generic',
        name: 'জেনেরিক',
        productTypes: [
          { id: 'deepchach', name: 'ডিপ চাচ' }
        ]
      }
    ]
  },
  {
    id: 'coil',
    name: 'কয়েল (পি-ফোমে)',
    companies: [
      {
        id: 'generic',
        name: 'জেনেরিক',
        productTypes: [
          { 
            id: 'coil', 
            name: 'কয়েল',
            thicknesses: generateThicknesses(4, 12, 1) 
          }
        ]
      }
    ]
  },
  {
    id: 'aluminum',
    name: 'অ্যালুমিনিয়াম',
    companies: [
      {
        id: 'grade',
        name: 'গ্রেড',
        productTypes: [
          { id: 'grade-a', name: 'এ-গ্রেড' },
          { id: 'grade-b', name: 'বি-গ্রেড' }
        ]
      }
    ]
  },
  {
    id: 'jhalt',
    name: 'ঝালট',
    // Sold by piece, no company, no size
    companies: [
      {
        id: 'generic',
        name: 'জেনেরিক',
        productTypes: [
          { id: 'jhalt', name: 'ঝালট' }
        ]
      }
    ]
  }
];

// Helper function to generate thickness values
function generateThicknesses(start: number, end: number, step: number): string[] {
  const thicknesses: string[] = [];
  for (let i = start; i <= end; i += step) {
    thicknesses.push(i.toFixed(3));
  }
  return thicknesses;
}

// Generate size ranges
export function generateSizeRange(category: string): string[] {
  switch(category) {
    case 'tin':
    case 'plastictin':
    case 'flowerwavetin':
    case 'chachplastic':
      return ['6', '7', '8', '9', '10', '11', '12'];
    case 'tuya':
    case 'plainsheet':
      return ['6', '7', '8', '9', '10'];
    default:
      return [];
  }
}