// src/types/index.ts

export type Role = 'USER' | 'ADMIN';
export type Condition = 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: Role;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  sortOrder: number;
  _count?: { products: number };
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string; // Decimal comes as string from JSON
  stock: number;
  images: string[];
  era?: string;
  yearManufactured?: number;
  countryOfOrigin?: string;
  condition: Condition;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  categoryId: string;
  category: Pick<Category, 'id' | 'name' | 'slug'>;
  reviews?: Review[];
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string };
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtTime: string;
  product: Pick<Product, 'id' | 'name' | 'images' | 'slug'>;
}

export interface Order {
  id: string;
  status: OrderStatus;
  totalAmount: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingZip: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  user?: Pick<User, 'name' | 'email'>;
}

export interface Promotion {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  linkUrl?: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: PaginationMeta;
}

export interface ProductFilters {
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  era?: string;
  countryOfOrigin?: string;
  condition?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  limit?: number;
}
