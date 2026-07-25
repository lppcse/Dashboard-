import React, { useState } from 'react';
import { Search, Download, ArrowUpDown, Clock } from 'lucide-react';
import { SalesTransaction } from '../types';
import { formatCurrency } from '../utils/dataGenerator';

interface TransactionTableProps {
  transactions: SalesTransaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortAsc, setSortAsc] = useState(false);

  // Filtered transactions
  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort by timestamp
  const sorted = [...filtered].sort((a, b) => {
    const timeA = a.timestamp.getTime();
    const timeB = b.timestamp.getTime();
    return sortAsc ? timeA - timeB : timeB - timeA;
  });

  const exportCSV = () => {
    const headers = ['Order ID', 'Timestamp', 'Product', 'Category', 'Region', 'Quantity', 'Unit Price ($)', 'Total ($)'];
    const rows = sorted.map((tx) => [
      tx.id,
      tx.timestamp.toISOString(),
      `"${tx.productName}"`,
      tx.category,
      tx.region,
      tx.quantity,
      tx.unitPrice,
      tx.amount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `sales_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-xl shadow-slate-950/40 p-4 mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            Live Transaction Stream Feed
          </h3>
          <p className="text-xs text-slate-400">Real-time order logs as they occur in the system</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search product, ID, region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 w-44 sm:w-56"
            />
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors border border-slate-700/60 shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-[380px] overflow-y-auto rounded-lg border border-slate-800 scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-semibold sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Order ID</th>
              <th className="py-2.5 px-3 cursor-pointer select-none" onClick={() => setSortAsc(!sortAsc)}>
                <div className="flex items-center gap-1 hover:text-slate-200">
                  Time
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
              <th className="py-2.5 px-3">Product Name</th>
              <th className="py-2.5 px-3">Category</th>
              <th className="py-2.5 px-3">Region</th>
              <th className="py-2.5 px-3 text-right">Qty</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {sorted.length > 0 ? (
              sorted.slice(0, 50).map((tx, idx) => (
                <tr
                  key={tx.id}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    idx === 0 ? 'bg-indigo-950/30 text-indigo-200 font-medium' : ''
                  }`}
                >
                  <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{tx.id.split('-').slice(0, 2).join('-')}</td>
                  <td className="py-2 px-3 text-slate-400 whitespace-nowrap font-mono">
                    {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-2 px-3 font-medium text-slate-100">{tx.productName}</td>
                  <td className="py-2 px-3">
                    <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800 text-indigo-300 border border-slate-700/50">
                      {tx.category}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-400">{tx.region}</td>
                  <td className="py-2 px-3 text-right font-medium text-slate-300">{tx.quantity}</td>
                  <td className="py-2 px-3 text-right font-bold font-mono text-emerald-400">
                    {formatCurrency(tx.amount)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No matching sales transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
