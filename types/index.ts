export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

export interface Category {
  id: string;
  name: string;
  companies?: Company[];
}

export interface Company {
  id: string;
  name: string;
  productTypes?: ProductType[];
}

export interface ProductType {
  id: string;
  name: string;
  colors?: Color[];
  hasColors?: boolean;
}

export interface Color {
  id: string;
  name: string;
  code: string;
}

export interface Size {
  id: string;
  value: string;
  unit: string;
}

export interface Thickness {
  id: string;
  value: string;
  unit: string;
}

export interface Product {
  id: string;
  categoryId: string;
  categoryName: string;
  companyId?: string;
  companyName?: string;
  productTypeId?: string;
  productTypeName?: string;
  colorId?: string;
  colorName?: string;
  size?: Size;
  thickness?: Thickness;
  purchasePrice: number;
  salePrice: number;
  stock: number;
  lowStockThreshold: number;
  imageUri?: string;
  unit: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  totalPrice: number;
  profit: number;
}

export interface Supplier {
  id: string;
  name: string;
  mobile: string;
  company?: string;
  address?: string;
}

export interface StockItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  type: 'in' | 'out';
  date: string;
  supplierId?: string;
  supplierName?: string;
  price: number;
}

export interface Sale {
  id: string;
  items: CartItem[];
  customerName: string;
  customerMobile?: string;
  customerAddress?: string;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  advance: number;
  due: number;
  date: string;
  profit: number;
}

// Default data for categories, companies and product types
export const DEFAULT_CATEGORIES: Category[] = [
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
            hasColors: false
          },
          {
            id: '2',
            name: 'লুম',
            hasColors: false
          },
          {
            id: '3',
            name: 'কালার',
            hasColors: true,
            colors: [
              { id: '1', name: 'CNG (ডার্ক গ্রীন)', code: '#006400' },
              { id: '2', name: 'ব্লু', code: '#0000FF' },
              { id: '3', name: 'রেড', code: '#FF0000' }
            ]
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
            hasColors: false
          },
          {
            id: '2',
            name: 'লুম',
            hasColors: false
          },
          {
            id: '3',
            name: 'কালার',
            hasColors: true,
            colors: [
              { id: '1', name: 'CNG (ডার্ক গ্রীন)', code: '#006400' },
              { id: '2', name: 'ব্লু', code: '#0000FF' },
              { id: '3', name: 'রেড', code: '#FF0000' }
            ]
          }
        ]
      },
      {
        id: '3',
        name: 'TK (G)',
        productTypes: []
      },
      {
        id: '4',
        name: 'ABUL Khair',
        productTypes: []
      },
      {
        id: '5',
        name: 'Jalalabad',
        productTypes: []
      },
      {
        id: '6',
        name: 'Gelco Steel',
        productTypes: []
      }
    ]
  },
  {
    id: '2',
    name: 'টুয়া',
    companies: []
  },
  {
    id: '3',
    name: 'প্লেইন শিট',
    companies: []
  },
  {
    id: '4',
    name: 'ফুলের শিট',
    companies: []
  },
  {
    id: '5',
    name: 'প্লাস্টিকের টিন',
    companies: [
      {
        id: '1',
        name: 'RFL',
        productTypes: []
      }
    ]
  },
  {
    id: '6',
    name: 'ফুলের ঢেউটিন',
    companies: [
      {
        id: '1',
        name: 'PHP',
        productTypes: []
      }
    ]
  },
  {
    id: '7',
    name: 'চাচের প্লাস্টিক (সেলু লাইট)',
    companies: []
  },
  {
    id: '8',
    name: 'চাচ ডিজিটাল',
    companies: []
  },
  {
    id: '9',
    name: 'ডিপ চাচ',
    companies: []
  },
  {
    id: '10',
    name: 'কয়েল (পি-ফোমে)',
    companies: []
  },
  {
    id: '11',
    name: 'অ্যালুমিনিয়াম',
    companies: [
      {
        id: '1',
        name: 'এ-গ্রেড',
        productTypes: []
      },
      {
        id: '2',
        name: 'বি-গ্রেড',
        productTypes: []
      }
    ]
  },
  {
    id: '12',
    name: 'ঝালট',
    companies: []
  }
];

export const DEFAULT_THICKNESSES = {
  'PHP': ['0.120', '0.130', '0.140', '0.150', '0.160', '0.170', '0.180', '0.190', '0.200', '0.210', '0.220', '0.230', '0.240', '0.250', '0.260', '0.270', '0.280', '0.290', '0.300', '0.310', '0.320', '0.330', '0.340', '0.350', '0.360', '0.370', '0.380', '0.390', '0.400', '0.410', '0.420', '0.430', '0.440', '0.450', '0.460', '0.470', '0.480', '0.490', '0.500', '0.510'],
  'KY': ['0.120', '0.130', '0.140', '0.150', '0.160', '0.170', '0.180', '0.190', '0.200', '0.210', '0.220', '0.230', '0.240', '0.250', '0.260', '0.270', '0.280', '0.290', '0.300', '0.310', '0.320', '0.330', '0.340', '0.350', '0.360', '0.370', '0.380', '0.390', '0.400', '0.410', '0.420', '0.430', '0.440', '0.450', '0.460', '0.470', '0.480', '0.490', '0.500', '0.510'],
  'TK (G)': ['0.120', '0.130', '0.140', '0.150', '0.160', '0.170', '0.180', '0.190', '0.200', '0.210', '0.220', '0.230', '0.240', '0.250', '0.260', '0.270', '0.280', '0.290', '0.300', '0.310', '0.320', '0.330', '0.340', '0.350', '0.360', '0.370', '0.380', '0.390', '0.400', '0.410', '0.420', '0.430', '0.440', '0.450', '0.460', '0.470', '0.480', '0.490', '0.500', '0.510'],
  'ABUL Khair': ['0.120', '0.130', '0.140', '0.150', '0.160', '0.170', '0.180', '0.190', '0.200', '0.210', '0.220', '0.230', '0.240', '0.250', '0.260', '0.270', '0.280', '0.290', '0.300', '0.310', '0.320', '0.330', '0.340', '0.350', '0.360', '0.370', '0.380', '0.390', '0.400', '0.410', '0.420', '0.430', '0.440', '0.450', '0.460'],
  'Jalalabad': ['0.250', '0.350', '0.380', '0.420', '0.460', '0.480', '0.520', '0.540', '0.580', '0.620', '0.640', '0.720'],
  'Gelco Steel': ['0.120', '0.130', '0.140', '0.150', '0.160', '0.170', '0.180', '0.190', '0.200', '0.210', '0.220', '0.230', '0.240', '0.250', '0.260', '0.270', '0.280', '0.290', '0.300', '0.310', '0.320', '0.330', '0.340', '0.350', '0.360', '0.370', '0.380', '0.390', '0.400', '0.410', '0.420', '0.430', '0.440', '0.450', '0.460'],
  'RFL': ['0.75', '1.00', '1.25', '1.50', '1.75'],
  'কয়েল': ['4.00', '5.00', '6.00', '7.00', '8.00', '9.00', '10.00', '11.00', '12.00']
};

export const TIN_SIZES = ['6', '7', '8', '9', '10', '11', '12'];
export const TUA_SIZES = ['6', '7', '8', '9', '10'];