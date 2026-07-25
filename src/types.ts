export type Category = 'Electronics' | 'Apparel' | 'Home & Living' | 'Fitness & Outdoors' | 'Books & Media' | 'Beauty & Care';

export type Region = 'North America' | 'Europe' | 'Asia Pacific' | 'Latin America' | 'Middle East & Africa';

export interface SalesTransaction {
  id: string;
  timestamp: Date;
  productName: string;
  category: Category;
  region: Region;
  amount: number;
  quantity: number;
  unitPrice: number;
}

export type MetricType = 'revenue' | 'quantity' | 'avgOrderValue' | 'transactionCount';

export type ViewMode = 'grid' | 'line' | 'bar' | 'pie' | 'donut';

export interface TimeSeriesPoint {
  timestamp: Date;
  timeLabel: string;
  revenue: number;
  quantity: number;
  orderCount: number;
  avgOrderValue: number;
}

export interface CategorySummary {
  category: Category;
  revenue: number;
  quantity: number;
  orderCount: number;
  color: string;
}

export interface RegionSummary {
  region: Region;
  revenue: number;
  quantity: number;
  orderCount: number;
  color: string;
}

export interface FilterOptions {
  category: Category | 'All';
  region: Region | 'All';
  metric: MetricType;
  timeWindow: number; // number of data points or minutes
}

export const CATEGORY_COLORS: Record<Category, string> = {
  'Electronics': '#3b82f6', // blue
  'Apparel': '#ec4899', // pink
  'Home & Living': '#10b981', // emerald
  'Fitness & Outdoors': '#f59e0b', // amber
  'Books & Media': '#8b5cf6', // purple
  'Beauty & Care': '#06b6d4', // cyan
};

export const REGION_COLORS: Record<Region, string> = {
  'North America': '#6366f1',
  'Europe': '#14b8a6',
  'Asia Pacific': '#f97316',
  'Latin America': '#e11d48',
  'Middle East & Africa': '#84cc16',
};
