import React from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Zap, Award } from 'lucide-react';
import { SalesTransaction } from '../types';
import { formatCurrency } from '../utils/dataGenerator';

interface KpiCardsProps {
  transactions: SalesTransaction[];
  isStreaming: boolean;
  streamRate: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ transactions, isStreaming, streamRate }) => {
  const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalOrders = transactions.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Find top category
  const categoryCounts: Record<string, number> = {};
  transactions.forEach((tx) => {
    categoryCounts[tx.category] = (categoryCounts[tx.category] || 0) + tx.amount;
  });

  let topCategory = 'N/A';
  let topCategoryRevenue = 0;
  Object.entries(categoryCounts).forEach(([cat, rev]) => {
    if (rev > topCategoryRevenue) {
      topCategoryRevenue = rev;
      topCategory = cat;
    }
  });

  // Calculate live sales velocity ($ / min over last 2 minutes)
  const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
  const recentTxs = transactions.filter((tx) => tx.timestamp.getTime() >= twoMinutesAgo);
  const recentRevenue = recentTxs.reduce((sum, tx) => sum + tx.amount, 0);
  const salesVelocityPerMin = Math.round(recentRevenue / 2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Revenue Card */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-lg shadow-slate-950/40 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Volume</span>
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-emerald-400 tracking-tight">
            {formatCurrency(totalRevenue)}
          </span>
          {isStreaming && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live
            </span>
          )}
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Stream updating continuously</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-sky-500"></div>
      </div>

      {/* Total Orders Card */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-lg shadow-slate-950/40 relative overflow-hidden group hover:border-sky-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Orders</span>
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <ShoppingBag className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-sky-400 tracking-tight">
            {totalOrders.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {totalOrders > 0 ? `${(totalOrders / 30).toFixed(1)}/min` : '0/min'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <span>Active streaming node</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 to-emerald-500"></div>
      </div>

      {/* Average Order Value Card */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-lg shadow-slate-950/40 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Order Value</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-2xl font-mono font-bold text-slate-100 tracking-tight">
            {formatCurrency(avgOrderValue)}
          </span>
          <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            ~${salesVelocityPerMin}/min
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Sales Velocity</span>
          <span className="font-semibold text-emerald-400">{formatCurrency(salesVelocityPerMin)}/m</span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
      </div>

      {/* Top Category Card */}
      <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-lg shadow-slate-950/40 relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Top Category</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <span className="text-lg font-bold text-amber-300 tracking-tight truncate max-w-[150px]">
            {topCategory}
          </span>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
            {formatCurrency(topCategoryRevenue)}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Leading segment</span>
          <span className="font-semibold text-slate-200">
            {totalRevenue > 0 ? `${((topCategoryRevenue / totalRevenue) * 100).toFixed(0)}%` : '0%'}
          </span>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-rose-500"></div>
      </div>
    </div>
  );
};
