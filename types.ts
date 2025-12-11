
export enum UserRole {
  ADMIN = 'Administrador',
  SELLER = 'Vendedor',
  SALES_MANAGER = 'Gerente de Ventas',
  STOCK_MANAGER = 'Encargado de Stock'
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string;
  address: string;
  isActive: boolean;
}

export interface Brand {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  isActive: boolean;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  brandId: string;
  buyPrice: number;
  priceRetail: number;    // Menudeo
  priceWholesale: number; // Mayoreo
  priceSpecial: number;   // Especial/Distribuidor
  stock: number;
  minStock: number;       // Stock Mínimo para alertas
  imageUrl: string;
  isActive: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  finalPrice: number; // The specific price applied (retail, wholesale, or special)
}

export interface Sale {
  id: string;
  date: string;
  clientId: string | null;
  paymentMethod: string; // Stored as name/string for history preservation
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'completed' | 'canceled';
}

export interface CompanySettings {
  name: string;
  address: string;
  phone: string;
  logoUrl: string;
  currencySymbol: string;
  taxName: string; // e.g., "IGV", "IVA", "VAT"
  taxRate: number; // e.g., 18 for 18%
}

export interface CashRegisterSession {
  id: string;
  openedAt: string;
  closedAt: string | null;
  initialAmount: number;
  finalAmount: number | null;
  salesTotal: number; // Calculated system total
  status: 'open' | 'closed';
  notes?: string;
}
