import axiosClient from './axiosClient';
import {
  ApiResponse,
  AuthResponse,
  Category,
  DashboardOverview,
  DashboardSummary,
  InventoryAlert,
  Page,
  Product,
  ProductRequest,
  StockInRequest,
  StockOutRequest,
  StockTransaction,
  Supplier,
  SupplierRequest,
  AiOverview,
  StockOutPrediction,
  ReorderRecommendation,
  DemandForecast,
  RiskClassification,
  User,
} from '../types';

export const authApi = {
  login: async (credentials: { username: string; password: string }): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return res.data.data;
  },
  register: async (payload: { username: string; email: string; password: string; fullName: string; role?: string }): Promise<AuthResponse> => {
    const res = await axiosClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data;
  },
  me: async (): Promise<User> => {
    const res = await axiosClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },
};

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const res = await axiosClient.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
    return res.data.data;
  },
  getOverview: async (): Promise<DashboardOverview> => {
    const res = await axiosClient.get<ApiResponse<DashboardOverview>>('/dashboard/inventory-overview');
    return res.data.data;
  },
};

export const productApi = {
  getAll: async (params?: {
    search?: string;
    categoryId?: number;
    supplierId?: number;
    stockStatus?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<Page<Product>> => {
    const res = await axiosClient.get<ApiResponse<Page<Product>>>('/products', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<Product> => {
    const res = await axiosClient.get<ApiResponse<Product>>(`/products/${id}`);
    return res.data.data;
  },
  create: async (data: ProductRequest): Promise<Product> => {
    const res = await axiosClient.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },
  update: async (id: number, data: ProductRequest): Promise<Product> => {
    const res = await axiosClient.put<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/products/${id}`);
  },
  getLowStock: async (): Promise<Product[]> => {
    const res = await axiosClient.get<ApiResponse<Product[]>>('/products/low-stock');
    return res.data.data;
  },
};

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const res = await axiosClient.get<ApiResponse<Category[]>>('/categories');
    return res.data.data;
  },
};

export const supplierApi = {
  getAll: async (params?: { search?: string; status?: string; page?: number; size?: number }): Promise<Page<Supplier>> => {
    const res = await axiosClient.get<ApiResponse<Page<Supplier>>>('/suppliers', { params });
    return res.data.data;
  },
  getById: async (id: number): Promise<Supplier> => {
    const res = await axiosClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
    return res.data.data;
  },
  create: async (data: SupplierRequest): Promise<Supplier> => {
    const res = await axiosClient.post<ApiResponse<Supplier>>('/suppliers', data);
    return res.data.data;
  },
  update: async (id: number, data: SupplierRequest): Promise<Supplier> => {
    const res = await axiosClient.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
    return res.data.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/suppliers/${id}`);
  },
  getProducts: async (id: number): Promise<Product[]> => {
    const res = await axiosClient.get<ApiResponse<Product[]>>(`/suppliers/${id}/products`);
    return res.data.data;
  },
};

export const stockApi = {
  stockIn: async (data: StockInRequest): Promise<StockTransaction> => {
    const res = await axiosClient.post<ApiResponse<StockTransaction>>('/stock/in', data);
    return res.data.data;
  },
  stockOut: async (data: StockOutRequest): Promise<StockTransaction> => {
    const res = await axiosClient.post<ApiResponse<StockTransaction>>('/stock/out', data);
    return res.data.data;
  },
  getHistory: async (params?: {
    productId?: number;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Promise<Page<StockTransaction>> => {
    const res = await axiosClient.get<ApiResponse<Page<StockTransaction>>>('/stock/history', { params });
    return res.data.data;
  },
};

export const alertApi = {
  getAlerts: async (params?: { status?: string; alertType?: string; page?: number; size?: number }): Promise<Page<InventoryAlert>> => {
    const res = await axiosClient.get<ApiResponse<Page<InventoryAlert>>>('/alerts', { params });
    return res.data.data;
  },
  getActiveAlerts: async (): Promise<InventoryAlert[]> => {
    const res = await axiosClient.get<ApiResponse<InventoryAlert[]>>('/alerts/active');
    return res.data.data;
  },
  updateStatus: async (id: number, status: string): Promise<InventoryAlert> => {
    const res = await axiosClient.patch<ApiResponse<InventoryAlert>>(`/alerts/${id}/status`, { status });
    return res.data.data;
  },
};

export const aiApi = {
  getOverview: async (): Promise<AiOverview> => {
    const res = await axiosClient.get<ApiResponse<AiOverview>>('/ai/predictions');
    return res.data.data;
  },
  predictStockOut: async (productId: number): Promise<StockOutPrediction> => {
    const res = await axiosClient.get<ApiResponse<StockOutPrediction>>(`/ai/stock-out/${productId}`);
    return res.data.data;
  },
  recommendReorder: async (productId: number): Promise<ReorderRecommendation> => {
    const res = await axiosClient.get<ApiResponse<ReorderRecommendation>>(`/ai/reorder/${productId}`);
    return res.data.data;
  },
  forecastDemand: async (productId: number, horizonDays = 15): Promise<DemandForecast> => {
    const res = await axiosClient.get<ApiResponse<DemandForecast>>(`/ai/demand-forecast/${productId}`, {
      params: { horizonDays },
    });
    return res.data.data;
  },
  classifyRisk: async (productId: number): Promise<RiskClassification> => {
    const res = await axiosClient.get<ApiResponse<RiskClassification>>(`/ai/risk/${productId}`);
    return res.data.data;
  },
};

export const reportApi = {
  exportInventoryUrl: '/api/reports/export/inventory',
  exportTransactionsUrl: '/api/reports/export/transactions',
};

export const userApi = {
  getAll: async (): Promise<User[]> => {
    const res = await axiosClient.get<ApiResponse<User[]>>('/users');
    return res.data.data;
  },
  updateStatus: async (id: number, isActive: boolean): Promise<User> => {
    const res = await axiosClient.patch<ApiResponse<User>>(`/users/${id}/status`, { isActive });
    return res.data.data;
  },
  updateRole: async (id: number, role: string): Promise<User> => {
    const res = await axiosClient.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return res.data.data;
  },
};

