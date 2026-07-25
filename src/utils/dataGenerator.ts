import { Category, CategorySummary, MetricType, Region, RegionSummary, SalesTransaction, TimeSeriesPoint } from '../types';

const PRODUCTS: Record<Category, { name: string; basePrice: number }[]> = {
  'Electronics': [
    { name: 'Noise-Canceling Headphones', basePrice: 249 },
    { name: '4K Ultra HD Monitor', basePrice: 420 },
    { name: 'Wireless Ergonomic Mouse', basePrice: 65 },
    { name: 'Smartwatch Pro Series', basePrice: 299 },
    { name: 'Portable Bluetooth Speaker', basePrice: 110 }
  ],
  'Apparel': [
    { name: 'Merino Wool Sweater', basePrice: 98 },
    { name: 'Performance Running Jacket', basePrice: 135 },
    { name: 'Classic Indigo Denim', basePrice: 85 },
    { name: 'Breathable Training Tee', basePrice: 42 },
    { name: 'Leather Urban Boots', basePrice: 180 }
  ],
  'Home & Living': [
    { name: 'Espresso Barista Machine', basePrice: 550 },
    { name: 'Smart HEPA Air Purifier', basePrice: 210 },
    { name: 'Memory Foam Mattress Topper', basePrice: 145 },
    { name: 'Minimalist Ceramic Vase Set', basePrice: 55 },
    { name: 'Robotic Vacuum Cleaner', basePrice: 380 }
  ],
  'Fitness & Outdoors': [
    { name: 'Adjustable Dumbbell Set', basePrice: 280 },
    { name: 'All-Terrain Trekking Backpack', basePrice: 125 },
    { name: 'Non-Slip Yoga Mat Extra Thick', basePrice: 58 },
    { name: 'Hydration Pack 2.5L', basePrice: 72 },
    { name: 'Insulated Trail Water Bottle', basePrice: 38 }
  ],
  'Books & Media': [
    { name: 'System Design Architecture Book', basePrice: 49 },
    { name: 'E-Reader Paperwhite Edition', basePrice: 140 },
    { name: 'Vinyl Record Collector Box', basePrice: 95 },
    { name: 'Mastering Data Science Handbook', basePrice: 62 },
    { name: 'Audiobook Premium Pass', basePrice: 25 }
  ],
  'Beauty & Care': [
    { name: 'Hydrating Facial Serum', basePrice: 68 },
    { name: 'Sonic Toothbrush Kit', basePrice: 115 },
    { name: 'Organic Botanical Sunscreen', basePrice: 34 },
    { name: 'Nourishing Night Cream', basePrice: 82 },
    { name: 'Ionic Hair Dryer', basePrice: 160 }
  ]
};

const CATEGORIES: Category[] = [
  'Electronics',
  'Apparel',
  'Home & Living',
  'Fitness & Outdoors',
  'Books & Media',
  'Beauty & Care'
];

const REGIONS: Region[] = [
  'North America',
  'Europe',
  'Asia Pacific',
  'Latin America',
  'Middle East & Africa'
];

export function generateRandomTransaction(customTimestamp?: Date): SalesTransaction {
  const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
  const productList = PRODUCTS[category];
  const product = productList[Math.floor(Math.random() * productList.length)];
  const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
  
  // Quantity between 1 and 4
  const quantity = Math.floor(Math.random() * 3) + 1;
  // Price variance of +- 15%
  const variance = 1 + (Math.random() * 0.3 - 0.15);
  const unitPrice = Math.round(product.basePrice * variance);
  const amount = unitPrice * quantity;

  return {
    id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: customTimestamp || new Date(),
    productName: product.name,
    category,
    region,
    amount,
    quantity,
    unitPrice
  };
}

export function generateSeedTransactions(count: number = 40): SalesTransaction[] {
  const transactions: SalesTransaction[] = [];
  const now = Date.now();
  // Generate points spread back over the last 30 minutes
  const interval = (30 * 60 * 1000) / count;

  for (let i = 0; i < count; i++) {
    const timestamp = new Date(now - (count - i) * interval);
    transactions.push(generateRandomTransaction(timestamp));
  }

  return transactions;
}

export function aggregateTimeSeries(
  transactions: SalesTransaction[],
  bucketSizeSeconds: number = 15
): TimeSeriesPoint[] {
  if (transactions.length === 0) return [];

  // Sort by timestamp
  const sorted = [...transactions].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

  const buckets: Map<number, SalesTransaction[]> = new Map();

  sorted.forEach(tx => {
    const ms = tx.timestamp.getTime();
    const bucketKey = Math.floor(ms / (bucketSizeSeconds * 1000)) * (bucketSizeSeconds * 1000);
    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }
    buckets.get(bucketKey)!.push(tx);
  });

  const points: TimeSeriesPoint[] = [];

  buckets.forEach((txs, bucketTime) => {
    const date = new Date(bucketTime);
    const revenue = txs.reduce((sum, t) => sum + t.amount, 0);
    const quantity = txs.reduce((sum, t) => sum + t.quantity, 0);
    const orderCount = txs.length;
    const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    points.push({
      timestamp: date,
      timeLabel,
      revenue,
      quantity,
      orderCount,
      avgOrderValue: Math.round(avgOrderValue)
    });
  });

  return points;
}

export function aggregateByCategory(transactions: SalesTransaction[]): CategorySummary[] {
  const totals: Record<Category, { revenue: number; quantity: number; orderCount: number }> = {
    'Electronics': { revenue: 0, quantity: 0, orderCount: 0 },
    'Apparel': { revenue: 0, quantity: 0, orderCount: 0 },
    'Home & Living': { revenue: 0, quantity: 0, orderCount: 0 },
    'Fitness & Outdoors': { revenue: 0, quantity: 0, orderCount: 0 },
    'Books & Media': { revenue: 0, quantity: 0, orderCount: 0 },
    'Beauty & Care': { revenue: 0, quantity: 0, orderCount: 0 }
  };

  const colors: Record<Category, string> = {
    'Electronics': '#3b82f6',
    'Apparel': '#ec4899',
    'Home & Living': '#10b981',
    'Fitness & Outdoors': '#f59e0b',
    'Books & Media': '#8b5cf6',
    'Beauty & Care': '#06b6d4'
  };

  transactions.forEach(tx => {
    if (totals[tx.category]) {
      totals[tx.category].revenue += tx.amount;
      totals[tx.category].quantity += tx.quantity;
      totals[tx.category].orderCount += 1;
    }
  });

  return Object.entries(totals).map(([cat, data]) => ({
    category: cat as Category,
    revenue: data.revenue,
    quantity: data.quantity,
    orderCount: data.orderCount,
    color: colors[cat as Category] || '#64748b'
  }));
}

export function aggregateByRegion(transactions: SalesTransaction[]): RegionSummary[] {
  const totals: Record<Region, { revenue: number; quantity: number; orderCount: number }> = {
    'North America': { revenue: 0, quantity: 0, orderCount: 0 },
    'Europe': { revenue: 0, quantity: 0, orderCount: 0 },
    'Asia Pacific': { revenue: 0, quantity: 0, orderCount: 0 },
    'Latin America': { revenue: 0, quantity: 0, orderCount: 0 },
    'Middle East & Africa': { revenue: 0, quantity: 0, orderCount: 0 }
  };

  const colors: Record<Region, string> = {
    'North America': '#6366f1',
    'Europe': '#14b8a6',
    'Asia Pacific': '#f97316',
    'Latin America': '#e11d48',
    'Middle East & Africa': '#84cc16'
  };

  transactions.forEach(tx => {
    if (totals[tx.region]) {
      totals[tx.region].revenue += tx.amount;
      totals[tx.region].quantity += tx.quantity;
      totals[tx.region].orderCount += 1;
    }
  });

  return Object.entries(totals).map(([reg, data]) => ({
    region: reg as Region,
    revenue: data.revenue,
    quantity: data.quantity,
    orderCount: data.orderCount,
    color: colors[reg as Region] || '#64748b'
  }));
}

export function getMetricValue(item: { revenue: number; quantity: number; orderCount: number }, metric: MetricType): number {
  switch (metric) {
    case 'revenue':
      return item.revenue;
    case 'quantity':
      return item.quantity;
    case 'transactionCount':
      return item.orderCount;
    case 'avgOrderValue':
      return item.orderCount > 0 ? Math.round(item.revenue / item.orderCount) : 0;
    default:
      return item.revenue;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}
