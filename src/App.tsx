import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Disc,
  LineChart,
  PieChart as PieIcon,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { ControlBar } from './components/ControlBar';
import { D3BarChart } from './components/D3BarChart';
import { D3DonutChart } from './components/D3DonutChart';
import { D3LineChart } from './components/D3LineChart';
import { D3PieChart } from './components/D3PieChart';
import { KpiCards } from './components/KpiCards';
import { ManualTransactionModal } from './components/ManualTransactionModal';
import { TransactionTable } from './components/TransactionTable';
import { FilterOptions, SalesTransaction, ViewMode } from './types';
import {
  aggregateByCategory,
  aggregateByRegion,
  aggregateTimeSeries,
  generateRandomTransaction,
  generateSeedTransactions,
  getMetricValue,
} from './utils/dataGenerator';

export default function App() {
  // State for streaming sales transactions
  const [transactions, setTransactions] = useState<SalesTransaction[]>(() =>
    generateSeedTransactions(35)
  );

  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamSpeed, setStreamSpeed] = useState<number>(1);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [barSegmentMode, setBarSegmentMode] = useState<'category' | 'region'>('category');
  const [donutInnerRadius, setDonutInnerRadius] = useState<number>(0.6);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);

  // Filters
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'All',
    region: 'All',
    metric: 'revenue',
    timeWindow: 30,
  });

  // Real-Time Streaming Interval Effect
  useEffect(() => {
    if (!isStreaming) return;

    // Base interval is 2000ms at 1x speed
    const intervalMs = Math.max(200, 2000 / streamSpeed);

    const timer = setInterval(() => {
      const newTx = generateRandomTransaction();
      setTransactions((prev) => {
        const updated = [...prev, newTx];
        return updated.length > 200 ? updated.slice(updated.length - 200) : updated;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isStreaming, streamSpeed]);

  // Reset and re-seed data
  const handleResetData = () => {
    setTransactions(generateSeedTransactions(35));
  };

  // Add manual transaction
  const handleAddManualTransaction = (tx: SalesTransaction) => {
    setTransactions((prev) => [...prev, tx]);
  };

  // Filtered transactions based on Category & Region dropdowns
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchCat = filters.category === 'All' || tx.category === filters.category;
      const matchReg = filters.region === 'All' || tx.region === filters.region;
      return matchCat && matchReg;
    });
  }, [transactions, filters.category, filters.region]);

  // Aggregate time series for line chart
  const timeSeriesData = useMemo(() => {
    return aggregateTimeSeries(filteredTransactions, 15);
  }, [filteredTransactions]);

  // Aggregate by Category
  const categoryData = useMemo(() => {
    return aggregateByCategory(filteredTransactions);
  }, [filteredTransactions]);

  // Aggregate by Region
  const regionData = useMemo(() => {
    return aggregateByRegion(filteredTransactions);
  }, [filteredTransactions]);

  // Formatted data items for Bar Chart
  const barChartData = useMemo(() => {
    const rawList = barSegmentMode === 'category' ? categoryData : regionData;
    return rawList.map((item) => {
      const label = 'category' in item ? item.category : item.region;
      return {
        label,
        value: getMetricValue(item, filters.metric),
        revenue: item.revenue,
        quantity: item.quantity,
        orderCount: item.orderCount,
        color: item.color,
      };
    });
  }, [categoryData, regionData, barSegmentMode, filters.metric]);

  // Formatted data items for Pie Chart
  const pieChartData = useMemo(() => {
    return categoryData.map((c) => ({
      label: c.category,
      value: getMetricValue(c, filters.metric),
      revenue: c.revenue,
      color: c.color,
      orderCount: c.orderCount,
    }));
  }, [categoryData, filters.metric]);

  // Formatted data items for Donut Chart
  const donutChartData = useMemo(() => {
    return regionData.map((r) => ({
      label: r.region,
      value: getMetricValue(r, filters.metric),
      revenue: r.revenue,
      color: r.color,
      orderCount: r.orderCount,
    }));
  }, [regionData, filters.metric]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased pb-12 selection:bg-indigo-500 selection:text-white">
      {/* Header Bar */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 shadow-lg shadow-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Activity className="w-5 h-5 animate-pulse text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">VeloceData Dashboard</h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Elegant Dark • D3.js
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Real-time sales telemetry with interactive Line, Bar, Pie & Donut views
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/80 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isStreaming ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              ></span>
              <span className="font-semibold text-slate-200">
                {isStreaming ? 'Live Stream' : 'Stream Paused'}
              </span>
            </div>

            <button
              onClick={handleResetData}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Stream</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* KPI Cards */}
        <KpiCards
          transactions={filteredTransactions}
          isStreaming={isStreaming}
          streamRate={streamSpeed}
        />

        {/* Chart Controls & View Selector Bar */}
        <ControlBar
          viewMode={viewMode}
          setViewMode={setViewMode}
          isStreaming={isStreaming}
          toggleStreaming={() => setIsStreaming(!isStreaming)}
          streamSpeed={streamSpeed}
          setStreamSpeed={setStreamSpeed}
          filters={filters}
          setFilters={setFilters}
          onOpenManualModal={() => setIsManualModalOpen(true)}
          onResetData={handleResetData}
          totalTransactionsCount={filteredTransactions.length}
        />

        {/* Dynamic Chart Display depending on View Mode */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Line Chart */}
            <div className="lg:col-span-2">
              <D3LineChart data={timeSeriesData} metric={filters.metric} height={320} />
            </div>

            {/* 2. Bar Chart */}
            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Breakdown by
                </span>
                <div className="flex bg-slate-900 border border-slate-800 p-0.5 rounded-md text-xs font-medium">
                  <button
                    onClick={() => setBarSegmentMode('category')}
                    className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                      barSegmentMode === 'category' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Category
                  </button>
                  <button
                    onClick={() => setBarSegmentMode('region')}
                    className={`px-2.5 py-0.5 rounded-sm transition-colors ${
                      barSegmentMode === 'region' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Region
                  </button>
                </div>
              </div>
              <D3BarChart data={barChartData} metric={filters.metric} height={300} />
            </div>

            {/* 3. Pie Chart */}
            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Category Shares
                </span>
              </div>
              <D3PieChart data={pieChartData} metric={filters.metric} height={300} />
            </div>

            {/* 4. Donut Chart */}
            <div className="lg:col-span-2">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Regional Distribution Donut
                </span>
              </div>
              <D3DonutChart
                data={donutChartData}
                metric={filters.metric}
                height={300}
                innerRadiusRatio={donutInnerRadius}
              />
            </div>
          </div>
        )}

        {/* Dedicated Focused Views */}
        {viewMode === 'line' && (
          <div className="space-y-4">
            <D3LineChart
              data={timeSeriesData}
              metric={filters.metric}
              height={440}
              title="Expanded Line Chart - Real-Time Sales Growth Trend"
            />
          </div>
        )}

        {viewMode === 'bar' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Group By Dimension:</span>
              <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setBarSegmentMode('category')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    barSegmentMode === 'category' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Product Category
                </button>
                <button
                  onClick={() => setBarSegmentMode('region')}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    barSegmentMode === 'region' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Geographic Region
                </button>
              </div>
            </div>
            <D3BarChart
              data={barChartData}
              metric={filters.metric}
              height={440}
              title={`Focused Bar Chart - ${
                barSegmentMode === 'category' ? 'Category Comparison' : 'Regional Comparison'
              }`}
            />
          </div>
        )}

        {viewMode === 'pie' && (
          <div className="space-y-4">
            <D3PieChart
              data={pieChartData}
              metric={filters.metric}
              height={440}
              title="Focused Pie Chart - Category Proportions"
            />
          </div>
        )}

        {viewMode === 'donut' && (
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-300">Inner Radius Cutout:</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-indigo-400 font-mono font-bold">{(donutInnerRadius * 100).toFixed(0)}%</span>
                <input
                  type="range"
                  min={0.3}
                  max={0.8}
                  step={0.05}
                  value={donutInnerRadius}
                  onChange={(e) => setDonutInnerRadius(parseFloat(e.target.value))}
                  className="w-36 accent-indigo-500 cursor-pointer"
                />
              </div>
            </div>
            <D3DonutChart
              data={donutChartData}
              metric={filters.metric}
              height={440}
              innerRadiusRatio={donutInnerRadius}
              title="Focused Donut Chart - Regional Market Proportions"
            />
          </div>
        )}

        {/* Real-time Streaming Table Log */}
        <TransactionTable transactions={filteredTransactions} />
      </main>

      {/* Manual Transaction Modal */}
      <ManualTransactionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        onAddTransaction={handleAddManualTransaction}
      />
    </div>
  );
}
