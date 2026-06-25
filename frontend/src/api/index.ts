// src/api/index.ts
import { apiClient } from './client';
import { ApiResponse, Product, Order, Category, Promotion, ProductFilters } from '../types';

// ── Auth ─────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; consentGiven: boolean }) =>
    apiClient.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>>('/auth/login', data),

  logout: (refreshToken: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  me: () =>
    apiClient.get<ApiResponse<any>>('/auth/me'),
};

// ── Products ─────────────────────────────────────────────
export const productsApi = {
  getAll: (filters: ProductFilters = {}) =>
    apiClient.get<ApiResponse<Product[]> & { meta: any }>('/products', { params: filters }),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<Product>>(`/products/${slug}`),

  getFeatured: (limit = 8) =>
    apiClient.get<ApiResponse<Product[]>>('/products/featured', { params: { limit } }),

  getRecommendations: () =>
    apiClient.get<ApiResponse<Product[]>>('/products/recommendations'),

  // Admin
  create: (data: Partial<Product>) =>
    apiClient.post<ApiResponse<Product>>('/products', data),

  update: (id: string, data: Partial<Product>) =>
    apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/products/${id}`),
};

// ── Countries (из товаров) ────────────────────────────────
export const countriesApi = {
  getAll: () =>
    apiClient.get<{ success: boolean; data: string[] }>('/products/countries'),
};

// ── Categories ───────────────────────────────────────────
export const categoriesApi = {
  getAll: () =>
    apiClient.get<ApiResponse<Category[]>>('/categories'),
};

// ── Orders ───────────────────────────────────────────────
export const ordersApi = {
  create: (data: {
    items: Array<{ productId: string; quantity: number }>;
    shippingAddress: string;
    shippingCity: string;
    shippingCountry: string;
    shippingZip: string;
    notes?: string;
  }) => apiClient.post<ApiResponse<Order>>('/orders', data),

  getById: (id: string) =>
    apiClient.get<ApiResponse<Order>>(`/orders/${id}`),

  getMyOrders: () =>
    apiClient.get<ApiResponse<Order[]>>('/users/orders'),

  // Admin
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get<ApiResponse<any>>('/orders', { params }),

  updateStatus: (id: string, status: string) =>
    apiClient.patch(`/orders/${id}/status`, { status }),
};

// ── Users ────────────────────────────────────────────────
export const usersApi = {
  updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
    apiClient.patch<ApiResponse<any>>('/users/profile', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/users/change-password', data),

  deleteAccount: () =>
    apiClient.delete('/users/account'),
};

// ── Promotions ───────────────────────────────────────────
export const promotionsApi = {
  getActive: () =>
    apiClient.get<ApiResponse<Promotion[]>>('/promotions'),

  // Admin
  getAll: () =>
    apiClient.get<ApiResponse<Promotion[]>>('/promotions/all'),

  create: (data: Partial<Promotion>) =>
    apiClient.post<ApiResponse<Promotion>>('/promotions', data),

  update: (id: string, data: Partial<Promotion>) =>
    apiClient.patch<ApiResponse<Promotion>>(`/promotions/${id}`, data),

  delete: (id: string) =>
    apiClient.delete(`/promotions/${id}`),
};

// ── Notifications ─────────────────────────────────────
export const notificationsApi = {
  getRules: () =>
    apiClient.get<ApiResponse<any[]>>('/notifications/rules'),
  createRule: (data: any) =>
    apiClient.post<ApiResponse<any>>('/notifications/rules', data),
  updateRule: (id: string, data: any) =>
    apiClient.patch<ApiResponse<any>>(`/notifications/rules/${id}`, data),
  deleteRule: (id: string) =>
    apiClient.delete(`/notifications/rules/${id}`),
  getAll: (page = 1) =>
    apiClient.get<any>('/notifications', { params: { page } }),
  markRead: (id: string) =>
    apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () =>
    apiClient.post('/notifications/read-all'),
};

// ── Events ───────────────────────────────────────────
export const eventsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<any[]>>('/events'),
  getById: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/events/${id}`),
  register: (id: string) =>
    apiClient.post<ApiResponse<any>>(`/events/${id}/register`),
  unregister: (id: string) =>
    apiClient.delete(`/events/${id}/register`),
  // Admin
  adminGetAll: () =>
    apiClient.get<ApiResponse<any[]>>('/events/admin/all'),
  getRegistrations: (id: string) =>
    apiClient.get<ApiResponse<any[]>>(`/events/${id}/registrations`),
  create: (data: any) =>
    apiClient.post<ApiResponse<any>>('/events', data),
  update: (id: string, data: any) =>
    apiClient.patch<ApiResponse<any>>(`/events/${id}`, data),
  delete: (id: string) =>
    apiClient.delete(`/events/${id}`),
};

// ── Fairs ────────────────────────────────────────────
export const fairsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<any[]>>('/fairs'),
  getById: (id: string) =>
    apiClient.get<ApiResponse<any>>(`/fairs/${id}`),
  // Admin
  adminGetAll: () =>
    apiClient.get<ApiResponse<any[]>>('/fairs/admin/all'),
  getFairProducts: (params?: any) =>
    apiClient.get<ApiResponse<any[]>>('/fairs/admin/products', { params }),
  create: (data: any) =>
    apiClient.post<ApiResponse<any>>('/fairs', data),
  update: (id: string, data: any) =>
    apiClient.patch<ApiResponse<any>>(`/fairs/${id}`, data),
  updateItems: (id: string, items: any[]) =>
    apiClient.put<ApiResponse<any>>(`/fairs/${id}/items`, { items }),
  delete: (id: string) =>
    apiClient.delete(`/fairs/${id}`),
};

// ── Settings ──────────────────────────────────────────
export const settingsApi = {
  get: () =>
    apiClient.get<ApiResponse<any>>('/settings'),
  update: (data: any) =>
    apiClient.patch<ApiResponse<any>>('/settings', data),
};

// ── Upload ────────────────────────────────────────────────
export const uploadApi = {
  image: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post<{ success: boolean; data: { url: string } }>(
      '/upload/image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },
};
