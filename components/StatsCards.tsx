import React from 'react';
import { Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Sample } from '../types';

interface StatsCardsProps {
  samples: Sample[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ samples }) => {
  const totalSamples = samples.length;
  const totalStock = samples.reduce((acc, curr) => acc + curr.stockQuantity, 0);
  const lowStockCount = samples.filter(s => s.stockQuantity < 10).length;
  const highSelectCount = samples.filter(s => s.selectionCount > 10).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
          <Package size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">总样品SKU</p>
          <p className="text-2xl font-bold text-gray-800">{totalSamples}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
          <CheckCircle size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">库存总数</p>
          <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-red-50 text-red-600 rounded-lg">
          <AlertTriangle size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">库存预警 (&lt;10)</p>
          <p className="text-2xl font-bold text-gray-800">{lowStockCount}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
          <TrendingUp size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">爆款样品 (&gt;10次)</p>
          <p className="text-2xl font-bold text-gray-800">{highSelectCount}</p>
        </div>
      </div>
    </div>
  );
};