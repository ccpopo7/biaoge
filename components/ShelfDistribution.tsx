import React, { useMemo } from 'react';
import { MapPin, Package } from 'lucide-react';
import { Sample } from '../types';

interface ShelfDistributionProps {
  samples: Sample[];
}

export const ShelfDistribution: React.FC<ShelfDistributionProps> = ({ samples }) => {
  const shelfData = useMemo(() => {
    const groups: Record<string, Sample[]> = {};
    samples.forEach(sample => {
      const loc = sample.locationCode || '未分配';
      if (!groups[loc]) groups[loc] = [];
      groups[loc].push(sample);
    });
    
    // Sort by location code
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
  }, [samples]);

  if (samples.length === 0) {
     return (
       <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
         <div className="bg-gray-50 p-6 rounded-full mb-4">
           <MapPin className="text-gray-300 w-12 h-12" />
         </div>
         <h3 className="text-lg font-medium text-gray-900">暂无货架数据</h3>
         <p className="text-gray-500 mt-1">请尝试更换筛选条件</p>
       </div>
     );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
              <th className="px-6 py-4 font-semibold w-48">货架编号</th>
              <th className="px-6 py-4 font-semibold w-32 text-center">SKU统计</th>
              <th className="px-6 py-4 font-semibold">货架商品分布</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shelfData.map(([location, items]) => (
              <tr key={location} className="hover:bg-gray-50/80 transition-colors">
                {/* Location Column */}
                <td className="px-6 py-6 align-top">
                  <div className="sticky top-20">
                    <div className="flex flex-col items-start space-y-2">
                        <div className="flex items-center text-blue-700 font-mono font-bold text-lg bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm w-full justify-center">
                            <MapPin size={18} className="mr-2 flex-shrink-0" />
                            {location}
                        </div>
                        <div className="text-xs text-gray-400 w-full text-center">
                            区域: {location.split('-')[0] || '?'}
                        </div>
                    </div>
                  </div>
                </td>

                {/* Count Column */}
                <td className="px-6 py-6 align-top text-center">
                   <div className="sticky top-24 flex flex-col items-center justify-center space-y-1">
                        <div className="text-3xl font-bold text-gray-700 font-mono tracking-tight">
                            {items.length}
                        </div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-wide">
                            Items
                        </div>
                   </div>
                </td>

                {/* Items Grid */}
                <td className="px-6 py-6 bg-gray-50/30">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map(item => (
                      <div key={item.id} className="group relative flex items-start space-x-3 p-3 border border-gray-200 rounded-xl hover:border-blue-400 hover:shadow-md hover:-translate-y-0.5 transition-all bg-white duration-200">
                        
                        {/* Image Section */}
                        <div className="relative flex-shrink-0">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-16 h-16 rounded-lg object-cover bg-gray-100 border border-gray-100 group-hover:scale-105 transition-transform duration-300" 
                          />
                          <div className={`absolute -top-2 -right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm border flex items-center justify-center min-w-[24px] z-10 ${item.stockQuantity < 10 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-gray-800 text-white border-gray-700'}`}>
                             {item.stockQuantity}
                          </div>
                        </div>

                        {/* Details Section */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                          
                          {/* Header: Name & Price */}
                          <div className="flex justify-between items-start mb-1">
                             <h4 className="text-sm font-semibold text-gray-900 truncate pr-2 w-full leading-tight" title={item.name}>
                               {item.name}
                             </h4>
                          </div>

                          {/* Meta: Brand & Price */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                            <span className="font-medium text-gray-700 truncate max-w-[50%] bg-gray-100 px-1.5 rounded-sm" title={item.brandName}>
                                {item.brandName || '无品牌'}
                            </span>
                            <span className="font-mono text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                                ¥{item.price}
                            </span>
                          </div>

                          {/* Footer: Tags */}
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-50 text-gray-500 border border-gray-200 truncate max-w-[80px]">
                              {item.category}
                            </span>
                             {item.mechanism && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-600 border border-orange-100 truncate max-w-[100px]" title={`机制: ${item.mechanism}`}>
                                  {item.mechanism}
                                </span>
                             )}
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};