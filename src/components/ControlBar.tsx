import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  LayoutGrid,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Disc,
  SlidersHorizontal,
  Zap,
} from 'lucide-react';
import { Category, FilterOptions, MetricType, Region, ViewMode } from '../types';

interface ControlBarProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  isStreaming: boolean;
  toggleStreaming: () => void;
  streamSpeed: number;
  setStreamSpeed: (speed: number) => void;
  filters: FilterOptions;
  setFilters: React.Dispatch<React.SetStateAction<FilterOptions>>;
  onOpenManualModal: () => void;
  onResetData: () => void;
  totalTransactionsCount: number;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  viewMode,
  setViewMode,
  isStreaming,
  toggleStreaming,
  streamSpeed,
  setStreamSpeed,
  filters,
  setFilters,
  onOpenManualModal,
  onResetData,
  totalTransactionsCount,
}) => {
  const categories: (Category | 'All')[] = [
    'All',
    'Electronics',
    'Apparel',
    'Home & Living',
    'Fitness & Outdoors',
    'Books & Media',
    'Beauty & Care',
  ];

  const regions: (Region | 'All')[] = [
    'All',
    'North America',
    'Europe',
    'Asia Pacific',
    'Latin America',
    'Middle East & Africa',
  ];

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-xl shadow-slate-950/50 mb-6 space-y-4">
      {/* Top row: View Switcher and Real-time Stream Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        {/* View Controls: Grid or Individual Chart Views */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 shrink-0">
            Layout View:
          </span>

          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid View (All 4)
          </button>

          <button
            onClick={() => setViewMode('line')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              viewMode === 'line'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Line Chart
          </button>

          <button
            onClick={() => setViewMode('bar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              viewMode === 'bar'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Bar Chart
          </button>

          <button
            onClick={() => setViewMode('pie')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              viewMode === 'pie'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            Pie Chart
          </button>

          <button
            onClick={() => setViewMode('donut')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              viewMode === 'donut'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-500'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
            }`}
          >
            <Disc className="w-3.5 h-3.5" />
            Donut Chart
          </button>
        </div>

        {/* Real-time Streaming Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          {/* Play/Pause */}
          <button
            onClick={toggleStreaming}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isStreaming
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20 border border-emerald-500'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                Pause Stream
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                Resume Stream
              </>
            )}
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-950/80 rounded-lg p-0.5 border border-slate-800">
            {[0.5, 1, 2, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setStreamSpeed(speed)}
                className={`px-2 py-0.5 text-xs font-medium rounded-md transition-colors ${
                  streamSpeed === speed
                    ? 'bg-indigo-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Add Sale Button */}
          <button
            onClick={onOpenManualModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-md shadow-indigo-600/20 border border-indigo-500"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Sale
          </button>

          {/* Reset/Seed Data */}
          <button
            onClick={onResetData}
            title="Reset & Regenerate Seed Data"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors border border-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom row: Filter Dropdowns & Metric Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span>Filters:</span>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Metric:</label>
            <select
              value={filters.metric}
              onChange={(e) => setFilters((f) => ({ ...f, metric: e.target.value as MetricType }))}
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              <option value="revenue" className="bg-slate-900 text-slate-200">Total Revenue ($)</option>
              <option value="quantity" className="bg-slate-900 text-slate-200">Units Sold</option>
              <option value="transactionCount" className="bg-slate-900 text-slate-200">Order Count</option>
              <option value="avgOrderValue" className="bg-slate-900 text-slate-200">Avg Order Value ($)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Category:</label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((f) => ({ ...f, category: e.target.value as Category | 'All' }))
              }
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1.5">
            <label className="text-slate-400 font-medium">Region:</label>
            <select
              value={filters.region}
              onChange={(e) =>
                setFilters((f) => ({ ...f, region: e.target.value as Region | 'All' }))
              }
              className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg} className="bg-slate-900 text-slate-200">
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="font-medium text-slate-300 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            <span className="text-indigo-400 font-bold font-mono">{totalTransactionsCount}</span> transactions logged
          </span>
          <div className="flex items-center gap-1 font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Rate: {streamSpeed}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};
