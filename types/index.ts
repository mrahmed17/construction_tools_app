export type User = {
  id: string;
  phone: string;
  name: string;
  role: 'admin' | 'user';
};

export type SupplierType = {
  id: string;
  name: string;
  phone: string;
  address: string;
  company: string;
  balance: number;
  lastPurchase: string;
};

export type ProductType = {
  id: string;
  category: ProductCategory;
  company?: string;
  type?: string;
  color?: string;
  thickness?: string;
  size?: string;
  grade?: string;
  print?: string;
  buyPrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  image?: ProductImage;
  supplier?: string;
  lastUpdated: string;
};

export type ProductCategory = 
  | 'টিন' 
  | 'টুয়া' 
  | 'প্লেইন শিট' 
  | 'ফুলের শিট' 
  | 'প্লাস্টিকের টিন' 
  | 'ফুলের ঢেউটিন'
  | 'চাচের প্লাস্টিক'
  | 'চাচ ডিজিটাল'
  | 'ডিপ চাচ'
  | 'কয়েল'
  | 'অ্যালুমিনিয়াম'
  | 'ঝালট';

export type TinCompany = 
  | 'php' 
  | 'KY' 
  | 'TK (G)' 
  | 'ABUL Khair'
  | 'Jalalabad'
  | 'Gelco Steel';

export type TinType = 'সুপার' | 'লুম' | 'কালার' | 'NOF';

export type TinColorType = 'CNG (ডার্ক গ্রীন)' | 'ব্লু' | 'রেড';

export type AluminumGrade = 'এ-গ্রেড' | 'বি-গ্রেড';

export type FlowerSheetPrint = 'প্রিন্টের শিট';

export type ProductImage = {
  uri: string;
  base64?: string;
};

export type Product = {
  id: string;
  category: ProductCategory;
  company?: string;
  type?: string;
  color?: string;
  thickness?: string;
  size?: string;
  grade?: string;
  print?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockAlert: number;
  image?: ProductImage;
  supplier?: string;
  lastUpdated: string;
};

export type CartItem = {
  productId: string;
  quantity: number;
  product: Product;
};

export type PriceConfig = {
  categoryId: string;
  minPrice: number;
  maxPrice: number;
};

// Thickness ranges for different companies
export const ThicknessRanges = {
  php: Array.from({length: 40}, (_, i) => (0.120 + i * 0.010).toFixed(3)),
  KY: Array.from({length: 40}, (_, i) => (0.120 + i * 0.010).toFixed(3)),
  'TK (G)': Array.from({length: 40}, (_, i) => (0.120 + i * 0.010).toFixed(3)),
  'ABUL Khair': Array.from({length: 35}, (_, i) => (0.12 + i * 0.01).toFixed(2)),
  'Jalalabad': ['0.25', '0.35', '0.38', '0.42', '0.46', '0.48', '0.52', '0.54', '0.58', '0.62', '0.64', '0.72'],
  'Gelco Steel': Array.from({length: 35}, (_, i) => (0.12 + i * 0.01).toFixed(2)),
  'RFL': Array.from({length: 5}, (_, i) => (0.75 + i * 0.25).toFixed(2)),
  'Coil': Array.from({length: 9}, (_, i) => (4 + i * 1).toString()),
};

// Size ranges for different categories
export const SizeRanges = {
  'টিন': Array.from({length: 7}, (_, i) => (6 + i).toString()),
  'টুয়া': Array.from({length: 5}, (_, i) => (6 + i).toString()),
  'প্লেইন শিট': Array.from({length: 5}, (_, i) => (6 + i).toString()),
  'ফুলের শিট': Array.from({length: 5}, (_, i) => (6 + i).toString()),
  'প্লাস্টিকের টিন': Array.from({length: 7}, (_, i) => (6 + i).toString()),
  'ফুলের ঢেউটিন': Array.from({length: 7}, (_, i) => (6 + i).toString()),
  'চাচের প্লাস্টিক': Array.from({length: 7}, (_, i) => (6 + i).toString()),
};

// Default product data structure
export const DefaultProductCategories: ProductCategory[] = [
  'টিন', 'টুয়া', 'প্লেইন শিট', 'ফুলের শিট', 'প্লাস্টিকের টিন', 'ফুলের ঢেউটিন',
  'চাচের প্লাস্টিক', 'চাচ ডিজিটাল', 'ডিপ চাচ', 'কয়েল', 'অ্যালুমিনিয়াম', 'ঝালট'
];

export const DefaultCompanies = {
  'টিন': ['php', 'KY', 'TK (G)', 'ABUL Khair', 'Jalalabad', 'Gelco Steel'],
  'টুয়া': ['php', 'KY', 'TK (G)', 'ABUL Khair', 'Jalalabad', 'Gelco Steel'],
  'প্লেইন শিট': ['php', 'KY', 'TK (G)', 'ABUL Khair', 'Jalalabad', 'Gelco Steel'],
  'ফুলের শিট': [], // No companies, but prints instead
  'প্লাস্টিকের টিন': ['RFL'],
  'ফুলের ঢেউটিন': ['php'],
  'চাচের প্লাস্টিক': [], // No companies
  'চাচ ডিজিটাল': [], // No companies
  'ডিপ চাচ': [], // No companies
  'কয়েল': [], // Generic
  'অ্যালুমিনিয়াম': [], // Just grades
  'ঝালট': [], // No companies
};

export const DefaultProductTypes = {
  'php': ['সুপার', 'লুম', 'কালার'],
  'KY': ['NOF', 'লুম', 'কালার'],
  'TK (G)': ['সুপার', 'লুম', 'কালার'],
  'ABUL Khair': ['সুপার', 'লুম', 'কালার'],
  'Jalalabad': ['সুপার', 'লুম', 'কালার'],
  'Gelco Steel': ['সুপার', 'লুম', 'কালার'],
};

export const DefaultColorTypes = {
  'কালার': ['CNG (ডার্ক গ্রীন)', 'ব্লু', 'রেড'],
};

export const DefaultFlowerSheetPrints = ['প্রিন্টের শিট'];

export const DefaultAluminumGrades = ['এ-গ্রেড', 'বি-গ্রেড'];

export type BillInfo = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  date: string;
  discount: number;
  advance: number;
  totalAmount: number;
  items: CartItem[];
};

export type StockItem = {
  id: string;
  productId: string;
  date: string;
  quantity: number;
  type: 'in' | 'out';
  supplierId?: string;
  billId?: string;
  notes?: string;
};

export type PriceListItem = {
  id: string;
  category: string;
  company?: string;
  type?: string;
  thickness?: string;
  size?: string;
  purchasePrice: number;
  sellingPrice: number;
  profit: number;
  updatedAt: string;
};

// MVVM Models - Clear separation of data models from view logic
export interface ProductModel {
  id: string;
  name: string;
  category: string;
  company?: string;
  type?: string;
  color?: string;
  thickness?: string;
  size?: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold: number;
  image?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CustomerModel {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalPurchases: number;
  lastPurchaseDate?: number;
  creditLimit: number;
  outstandingCredit: number;
  history: CreditHistoryItem[];
}

export interface CreditHistoryItem {
  id: string;
  date: number;
  amount: number;
  type: 'purchase' | 'payment';
  invoiceId?: string;
  notes?: string;
  dueDate?: number;
}

export interface MaterialEstimationResult {
  materialType: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

export interface DailyCashRecord {
  id: string;
  date: number;
  openingBalance: number;
  closingBalance: number;
  sales: number;
  expenses: number;
  notes?: string;
}