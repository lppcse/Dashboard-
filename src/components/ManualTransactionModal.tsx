import React, { useState } from 'react';
import { X, PlusCircle, ShoppingBag } from 'lucide-react';
import { Category, Region, SalesTransaction } from '../types';

interface ManualTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (tx: SalesTransaction) => void;
}

export const ManualTransactionModal: React.FC<ManualTransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
}) => {
  const [productName, setProductName] = useState('Custom Enterprise Order');
  const [category, setCategory] = useState<Category>('Electronics');
  const [region, setRegion] = useState<Region>('North America');
  const [amount, setAmount] = useState<number>(450);
  const [quantity, setQuantity] = useState<number>(1);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTx: SalesTransaction = {
      id: `TX-MANUAL-${Date.now()}`,
      timestamp: new Date(),
      productName: productName.trim() || 'Custom Order',
      category,
      region,
      amount: Number(amount) || 100,
      quantity: Number(quantity) || 1,
      unitPrice: Math.round((Number(amount) || 100) / (Number(quantity) || 1)),
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl shadow-slate-950 border border-slate-800 relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2 text-slate-100 font-bold text-lg">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          Inject Manual Sale
        </div>

        <p className="text-xs text-slate-400 mb-5">
          Manually trigger a real-time transaction to observe line, bar, pie, and donut charts stream updates immediately.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-800 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-slate-100 placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-xs border border-slate-800 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-slate-100"
              >
                <option value="Electronics" className="bg-slate-900 text-slate-200">Electronics</option>
                <option value="Apparel" className="bg-slate-900 text-slate-200">Apparel</option>
                <option value="Home & Living" className="bg-slate-900 text-slate-200">Home & Living</option>
                <option value="Fitness & Outdoors" className="bg-slate-900 text-slate-200">Fitness & Outdoors</option>
                <option value="Books & Media" className="bg-slate-900 text-slate-200">Books & Media</option>
                <option value="Beauty & Care" className="bg-slate-900 text-slate-200">Beauty & Care</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="w-full px-3 py-2 text-xs border border-slate-800 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-950 text-slate-100"
              >
                <option value="North America" className="bg-slate-900 text-slate-200">North America</option>
                <option value="Europe" className="bg-slate-900 text-slate-200">Europe</option>
                <option value="Asia Pacific" className="bg-slate-900 text-slate-200">Asia Pacific</option>
                <option value="Latin America" className="bg-slate-900 text-slate-200">Latin America</option>
                <option value="Middle East & Africa" className="bg-slate-900 text-slate-200">Middle East & Africa</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Amount ($)</label>
              <input
                type="number"
                min={1}
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-800 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-950 font-bold font-mono text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-800 rounded-lg focus:outline-hidden focus:border-indigo-500 bg-slate-950 font-mono text-slate-200"
              />
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-700/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-md shadow-indigo-600/30 border border-indigo-500"
            >
              <PlusCircle className="w-4 h-4" />
              Inject Real-Time Sale
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
