import React, { useState } from 'react';
import { Edit2, Trash2, MapPin, Video, ShoppingBag, Truck, User, Phone, Paperclip, FileSpreadsheet } from 'lucide-react';
import { Sample, Platform, Category } from '../types';

interface SampleTableProps {
  samples: Sample[];
  onEdit: (sample: Sample) => void;
  onDelete: (id: string) => void;
  onExport: (sample: Sample) => void;
}

const getPlatformColor = (platform: Platform) => {
  switch (platform) {
    case Platform.Douyin: return 'bg-black text-white';
    case Platform.Kuaishou: return 'bg-orange-500 text-white';
    case Platform.Taobao: return 'bg-orange-700 text-white';
    case Platform.Video号: return 'bg-green-600 text-white';
    case Platform.Pinduoduo: return 'bg-red-600 text-white';
    case Platform.PrivateDomain: return 'bg-indigo-600 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

const getCategoryBadge = (category: Category) => {
  const colors: Record<string, string> = {
    [Category.Clothing]: 'bg-pink-100 text-pink-700 border-pink-200',
    [Category.Food]: 'bg-green-100 text-green-700 border-green-200',
    [Category.Beauty]: 'bg-purple-100 text-purple-700 border-purple-200',
    [Category.Electronics]: 'bg-blue-100 text-blue-700 border-blue-200',
    [Category.Jewelry]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [Category.ShoesBags]: 'bg-rose-100 text-rose-700 border-rose-200',
    [Category.Home]: 'bg-orange-100 text-orange-700 border-orange-200',
    [Category.PersonalCare]: 'bg-cyan-100 text-cyan-700 border-cyan-200',
    [Category.Baby]: 'bg-red-100 text-red-700 border-red-200',
    [Category.Sports]: 'bg-lime-100 text-lime-700 border-lime-200',
    
    // New Categories
    [Category.WatchesAccessories]: 'bg-slate-100 text-slate-700 border-slate-200',
    [Category.FreshFood]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    [Category.BooksEducation]: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    [Category.GiftsCreative]: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    [Category.FlowersGardening]: 'bg-green-50 text-green-600 border-green-200',
    [Category.ToysInstruments]: 'bg-amber-100 text-amber-700 border-amber-200',
    [Category.SecondHand]: 'bg-stone-100 text-stone-700 border-stone-200',
    [Category.VirtualRecharge]: 'bg-sky-100 text-sky-700 border-sky-200',
    [Category.Automotive]: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    [Category.LocalLife]: 'bg-teal-100 text-teal-700 border-teal-200',
    [Category.Luxury]: 'bg-violet-100 text-violet-700 border-violet-200',
    [Category.MedicalHealth]: 'bg-blue-50 text-blue-600 border-blue-200',
    [Category.HealthSupplements]: 'bg-teal-50 text-teal-600 border-teal-200',
    [Category.Alcohol]: 'bg-red-50 text-red-600 border-red-200',
  };
  return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
};

const renderTextWithLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  return parts.map((part, index) => 
    urlRegex.test(part) ? (
      <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all" onClick={(e) => e.stopPropagation()}>
        {part}
      </a>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

export const SampleTable: React.FC<SampleTableProps> = ({ samples, onEdit, onDelete, onExport }) => {
  const [hoverState, setHoverState] = useState<{ url: string; x: number; y: number } | null>(null);

  const handleMouseMove = (e: React.MouseEvent, url: string) => {
    setHoverState({
      url,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseLeave = () => {
    setHoverState(null);
  };

  if (samples.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="bg-gray-50 p-6 rounded-full mb-4">
          <ShoppingBag className="text-gray-300 w-12 h-12" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">暂无样品数据</h3>
        <p className="text-gray-500 mt-1">请尝试更换筛选条件或添加新样品</p>
      </div>
    );
  }

  // Calculate position logic for the preview popup
  const previewStyle: React.CSSProperties = hoverState ? {
    left: hoverState.x + 280 > window.innerWidth ? 'auto' : hoverState.x + 20,
    right: hoverState.x + 280 > window.innerWidth ? window.innerWidth - hoverState.x + 20 : 'auto',
    top: hoverState.y + 280 > window.innerHeight ? 'auto' : hoverState.y - 100,
    bottom: hoverState.y + 280 > window.innerHeight ? window.innerHeight - hoverState.y : 'auto',
  } : {};

  return (
    <>
      {/* Image Preview Overlay - Follows Cursor */}
      {hoverState && (
        <div 
          className="fixed z-[100] pointer-events-none bg-white p-2 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] border border-gray-200 animate-in fade-in duration-75"
          style={previewStyle}
        >
           <img 
             src={hoverState.url} 
             alt="Preview" 
             className="w-64 h-64 object-contain rounded-lg bg-gray-50" 
           />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 tracking-wider">
                <th className="px-6 py-4 font-semibold w-[30%]">产品信息 / 对接</th>
                <th className="px-6 py-4 font-semibold">仓库位置 / 数量</th>
                <th className="px-6 py-4 font-semibold">直播价格 / 佣金</th>
                <th className="px-6 py-4 font-semibold">机制 / 平台</th>
                <th className="px-6 py-4 font-semibold text-center">热度</th>
                <th className="px-6 py-4 font-semibold text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {samples.map((sample) => (
                <tr key={sample.id} className="hover:bg-blue-50/50 transition-colors group">
                  {/* Product Info & Contacts */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="h-16 w-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100 relative cursor-zoom-in">
                        <img 
                          src={sample.imageUrl} 
                          alt={sample.name} 
                          className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          onMouseMove={(e) => handleMouseMove(e, sample.imageUrl)}
                          onMouseLeave={handleMouseLeave}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        {sample.brandName && (
                          <div className="text-xs text-gray-500 mb-0.5">{sample.brandName}</div>
                        )}
                        <h4 className="font-semibold text-gray-900 line-clamp-1 w-full" title={sample.name}>{sample.name}</h4>
                        <div className="mt-1 flex flex-wrap gap-2">
                           <span className={`text-xs px-2 py-0.5 rounded-full border ${getCategoryBadge(sample.category)}`}>
                            {sample.category}
                          </span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">
                            {sample.specs}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500 flex flex-col space-y-1 pl-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded flex items-center">商务: {sample.businessContact || '-'}</span>
                        <span className="text-gray-300">|</span>
                        <span className="flex items-center text-gray-600" title={`电话: ${sample.merchantPhone}`}>
                           <User size={10} className="mr-1" /> {sample.merchantContact || '-'}
                        </span>
                      </div>
                      {sample.merchantPhone && (
                        <div className="flex items-center text-gray-400">
                          <Phone size={10} className="mr-1" /> {sample.merchantPhone}
                        </div>
                      )}
                    </div>
                    
                    {/* Remarks Section */}
                    {(sample.remarks || (sample.remarkImages && sample.remarkImages.length > 0)) && (
                      <div className="mt-3 bg-amber-50 rounded border border-amber-100 p-2 text-xs text-amber-900">
                         {sample.remarks && (
                           <div className="mb-1.5 break-words whitespace-pre-wrap">
                             <span className="font-semibold text-amber-700 mr-1">备注:</span>
                             {renderTextWithLinks(sample.remarks)}
                           </div>
                         )}
                         {sample.remarkImages && sample.remarkImages.length > 0 && (
                           <div className="flex flex-wrap gap-1 mt-1">
                             {sample.remarkImages.map((img, idx) => (
                               <div key={idx} className="w-8 h-8 rounded border border-amber-200 overflow-hidden bg-white cursor-zoom-in relative group/img">
                                 <img 
                                   src={img} 
                                   alt="remark" 
                                   className="w-full h-full object-contain"
                                   onMouseMove={(e) => handleMouseMove(e, img)}
                                   onMouseLeave={handleMouseLeave}
                                 />
                               </div>
                             ))}
                           </div>
                         )}
                      </div>
                    )}
                  </td>

                  {/* Warehouse Location */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col space-y-1 mt-2">
                      <div className="flex items-center text-gray-800 font-mono font-medium">
                        <MapPin size={14} className="mr-1 text-blue-500" />
                        {sample.locationCode}
                      </div>
                      <div className="text-xs text-gray-500">
                        数量: <span className={`font-medium ${sample.stockQuantity < 10 ? 'text-red-600' : 'text-gray-700'}`}>{sample.stockQuantity}</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        入库: {sample.entryDate}
                      </div>
                      {sample.trackingNumber && (
                        <div className="text-[10px] text-gray-400 mt-0.5 w-32 truncate" title={`快递单号: ${sample.trackingNumber}`}>
                          单号: {sample.trackingNumber}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Pricing */}
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col mt-2">
                      <div className="flex items-center">
                         <span className="text-lg font-bold text-gray-900">¥{sample.price}</span>
                         {sample.isFreeShipping && (
                           <span className="ml-2 text-[10px] bg-green-50 text-green-600 border border-green-200 px-1 rounded flex items-center" title="直播包邮">
                             <Truck size={8} className="mr-1" />包邮
                           </span>
                         )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-xs text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded-md">
                          佣金: {sample.commissionRate}%
                        </span>
                      </div>
                      
                      {/* Procurement Price Info */}
                      <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100 flex items-center">
                        <span className="mr-1">成本:</span>
                        <span className="font-medium text-gray-700">¥{sample.procurementPrice || 0}</span>
                        {sample.includeShippingFee && (
                          <span className="text-[10px] ml-1 text-green-600 border border-green-200 px-1 rounded transform scale-90 origin-left">含运费</span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Live Info */}
                  <td className="px-6 py-4 align-top">
                     <div className="space-y-2 mt-2">
                        <div className="flex flex-wrap gap-1">
                          {sample.platform.map(p => (
                            <span key={p} className={`text-[10px] px-2 py-0.5 rounded flex items-center w-fit ${getPlatformColor(p)}`}>
                              <Video size={10} className="mr-1" /> {p}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-600 bg-gray-100 p-1.5 rounded border border-gray-200 max-w-[150px] line-clamp-2" title={sample.mechanism}>
                          {sample.mechanism}
                        </div>
                        {sample.assistantAnchor && (
                          <div className="text-[10px] text-gray-400 flex items-center">
                            助播: {sample.assistantAnchor}
                          </div>
                        )}
                     </div>
                  </td>

                   {/* Selection Count */}
                  <td className="px-6 py-4 text-center align-top">
                    <div className="inline-flex flex-col items-center justify-center bg-gray-50 rounded-lg px-3 py-1 mt-2">
                      <span className="text-sm font-bold text-gray-700">{sample.selectionCount}</span>
                      <span className="text-[10px] text-gray-400">被选次数</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right align-top">
                    <div className="flex justify-end space-x-1 mt-2">
                      <button 
                        onClick={() => onExport(sample)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                        title="导出表格"
                      >
                        <FileSpreadsheet size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(sample)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(sample.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};