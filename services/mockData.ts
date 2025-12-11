
import { User, UserRole, Client, Brand, Category, Product, Sale, CompanySettings, CashRegisterSession, PaymentMethod } from '../types';

export const DEFAULT_SETTINGS: CompanySettings = {
  name: 'PerfiSoft Store',
  address: 'Av. Principal 123, Ciudad',
  phone: '555-0000',
  logoUrl: '', // Empty uses default 'P'
  currencySymbol: 'S/',
  taxName: 'IGV',
  taxRate: 18
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@perfisoft.com', role: UserRole.ADMIN, isActive: true, avatarUrl: 'https://picsum.photos/100/100?random=1' },
  { id: '2', name: 'Juan Pérez', email: 'juan@perfisoft.com', role: UserRole.SELLER, isActive: true, avatarUrl: 'https://picsum.photos/100/100?random=2' },
  { id: '3', name: 'Maria Lopez', email: 'maria@perfisoft.com', role: UserRole.SALES_MANAGER, isActive: true, avatarUrl: 'https://picsum.photos/100/100?random=3' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: '1', name: 'Consumidor Final', email: '-', phone: '-', taxId: '00000000', address: '-', isActive: true },
  { id: '2', name: 'Empresa ABC S.A.', email: 'contacto@abc.com', phone: '555-1234', taxId: '20123456789', address: 'Av. Siempre Viva 123', isActive: true },
];

export const MOCK_BRANDS: Brand[] = [
  { id: '1', name: 'Nike', color: '#000000', isActive: true },
  { id: '2', name: 'Adidas', color: '#0051ba', isActive: true },
  { id: '3', name: 'Samsung', color: '#1428a0', isActive: true },
  { id: '4', name: 'Apple', color: '#555555', isActive: true },
];

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Zapatillas', color: '#ff6b6b', isActive: true },
  { id: '2', name: 'Electrónica', color: '#4ecdc4', isActive: true },
  { id: '3', name: 'Accesorios', color: '#ffe66d', isActive: true },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', name: 'Efectivo', isActive: true },
  { id: '2', name: 'Tarjeta de Crédito/Débito', isActive: true },
  { id: '3', name: 'Yape / Plin', isActive: true },
  { id: '4', name: 'Transferencia Bancaria', isActive: true },
];

export const MOCK_PRODUCTS: Product[] = [
  { 
    id: '1', code: 'P001', name: 'Nike Air Max', categoryId: '1', brandId: '1', 
    buyPrice: 80, priceRetail: 150, priceWholesale: 130, priceSpecial: 110, 
    stock: 50, minStock: 10, isActive: true, imageUrl: 'https://picsum.photos/200/200?random=10' 
  },
  { 
    id: '2', code: 'P002', name: 'Adidas Superstar', categoryId: '1', brandId: '2', 
    buyPrice: 60, priceRetail: 110, priceWholesale: 95, priceSpecial: 85, 
    stock: 35, minStock: 10, isActive: true, imageUrl: 'https://picsum.photos/200/200?random=11' 
  },
  { 
    id: '3', code: 'P003', name: 'Samsung Galaxy S23', categoryId: '2', brandId: '3', 
    buyPrice: 600, priceRetail: 900, priceWholesale: 850, priceSpecial: 800, 
    stock: 10, minStock: 15, isActive: true, imageUrl: 'https://picsum.photos/200/200?random=12' 
  },
  { 
    id: '4', code: 'P004', name: 'iPhone 14', categoryId: '2', brandId: '4', 
    buyPrice: 700, priceRetail: 1100, priceWholesale: 1050, priceSpecial: 980, 
    stock: 8, minStock: 5, isActive: true, imageUrl: 'https://picsum.photos/200/200?random=13' 
  },
];

export const MOCK_SALES: Sale[] = [
  { 
    id: '1001', 
    date: new Date(Date.now() - 86400000).toISOString(), 
    clientId: '1', 
    paymentMethod: 'Efectivo',
    items: [
      { ...MOCK_PRODUCTS[0], quantity: 1, finalPrice: 150 },
      { ...MOCK_PRODUCTS[2], quantity: 1, finalPrice: 900 }
    ],
    subtotal: 1050,
    tax: 0,
    total: 1050,
    status: 'completed'
  },
  { 
    id: '1002', 
    date: new Date().toISOString(), 
    clientId: '2', 
    paymentMethod: 'Transferencia Bancaria',
    items: [
      { ...MOCK_PRODUCTS[1], quantity: 2, finalPrice: 110 }
    ],
    subtotal: 220,
    tax: 0,
    total: 220,
    status: 'completed'
  }
];

export const MOCK_SESSIONS: CashRegisterSession[] = [];
