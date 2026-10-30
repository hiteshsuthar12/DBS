export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'ROLE_ADMIN' | 'ROLE_INVENTORY_MANAGER' | 'ROLE_STAFF';
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Supplier {
  id: number;
  supplierName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  gstNumber?: string;
  status: 'ACTIVE' | 'INACTIVE';
  totalProducts: number;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierRequest {
  supplierName: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  gstNumber?: string;
  status?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  categoryId: number;
  categoryName: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderLevel: number;
  supplierId?: number;
  supplierName?: string;
  stockStatus: 'HEALTHY' | 'LOW' | 'CRITICAL' | 'OUT_OF_STOCK';
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductRequest {
  name: string;
  sku: string;
  description?: string;
  categoryId: number;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  currentStock: number;
  minimumStockLevel: number;
  maximumStockLevel: number;
  reorderLevel: number;
  supplierId?: number;
}

export interface StockTransaction {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  supplierId?: number;
  supplierName?: string;
  transactionType: 'IN' | 'SALE' | 'DAMAGED' | 'EXPIRED' | 'INTERNAL_USAGE' | 'OTHER';
  quantity: number;
  previousStock: number;
  updatedStock: number;
  unitPrice: number;
  referenceNumber: string;
  remarks?: string;
  performedBy: string;
  transactionDate: string;
  createdAt: string;
}

export interface StockInRequest {
  productId: number;
  supplierId?: number;
  quantity: number;
  purchasePrice?: number;
  referenceNumber: string;
  remarks?: string;
  transactionDate?: string;
}

export interface StockOutRequest {
  productId: number;
  quantity: number;
  transactionType: string;
  referenceNumber: string;
  remarks?: string;
  transactionDate?: string;
}

export interface InventoryAlert {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  alertType: 'LOW_STOCK' | 'CRITICAL_STOCK' | 'OUT_OF_STOCK' | 'REORDER_REQUIRED';
  currentStock: number;
  thresholdStock: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalProducts: number;
  totalSuppliers: number;
  totalInventoryQuantity: number;
  totalInventoryValuation: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  stockInToday: number;
  stockOutToday: number;
  activeAlerts: number;
}

export interface CategoryDistribution {
  categoryName: string;
  productCount: number;
  stockQuantity: number;
  valuation: number;
}

export interface MonthlyMovement {
  month: string;
  stockIn: number;
  stockOut: number;
}

export interface TopSellingProduct {
  productId: number;
  productName: string;
  sku: string;
  totalSold: number;
}

export interface DashboardOverview {
  summary: DashboardSummary;
  monthlyMovements: MonthlyMovement[];
  categoryDistribution: CategoryDistribution[];
  topSellingProducts: TopSellingProduct[];
  recentTransactions: StockTransaction[];
  lowStockAlerts: InventoryAlert[];
}

export interface ForecastDataPoint {
  date: string;
  quantity: number;
}

export interface StockOutPrediction {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  averageDailyDemand: number;
  predictedStockOutDate: string;
  estimatedDaysRemaining: number;
  confidenceScore: number;
  riskLevel: 'HEALTHY' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isBaseline: boolean;
  explanation: string;
}

export interface ReorderRecommendation {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  reorderLevel: number;
  recommendedReorderQuantity: number;
  leadTimeDays: number;
  safetyStock: number;
  targetInventoryLevel: number;
  explanation: string;
}

export interface DemandForecast {
  productId: number;
  productName: string;
  sku: string;
  horizonDays: number;
  historicalDemand: ForecastDataPoint[];
  forecastedDemand: ForecastDataPoint[];
  modelType: string;
  accuracyMetric: string;
}

export interface RiskClassification {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  riskLevel: 'HEALTHY' | 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK' | 'CRITICAL';
  riskFactors: string[];
  actionRecommendation: string;
}

export interface AiOverview {
  totalEvaluated: number;
  criticalCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  healthyCount: number;
  topRisks: StockOutPrediction[];
  topRecommendations: ReorderRecommendation[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  empty: boolean;
}

