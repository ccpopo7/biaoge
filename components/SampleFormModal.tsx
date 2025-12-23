import React, { useState, useEffect } from 'react';
import { X, Upload, Save, Plus, Trash } from 'lucide-react';
import { Sample, Category, Platform } from '../types';
import { CATEGORY_OPTIONS, PLATFORM_OPTIONS } from '../constants';

interface SampleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sample: Sample) => void;
  initialData?: Sample | null;
}

const emptySample: Omit<Sample, 'id'> = {
  name: '',
  brandName: '',
  imageUrl: '',
  category: Category.Other,
  entryDate: new Date().toISOString().split('T')[0],
  locationCode: '',
  stockQuantity: 1,
  trackingNumber: '',
  price: 0,
  commissionRate: 0,
  mechanism: '',
  platform: [Platform.Douyin], // Default as array
  selectionCount: 0,
  specs: '',
  businessContact: '',
  merchantContact: '',
  merchantPhone: '',
  procurementPrice: 0,
  includeShippingFee: false,
  isFreeShipping: true,
  assistantAnchor: '',
  remarks: '',
  remarkImages: []
};

export const SampleFormModal: React.FC<SampleFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Omit<Sample, 'id'>>({ ...emptySample });
  const [previewImage, setPreviewImage] = useState<string>('');
  // Use local state for remark images preview as well
  const [remarkImages, setRemarkImages] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      const { id, ...rest } = initialData;
      setFormData(rest);
      setPreviewImage(rest.imageUrl);
      setRemarkImages(rest.remarkImages || []);
    } else {
      setFormData({ ...emptySample, entryDate: new Date().toISOString().split('T')[0] });
      setPreviewImage('');
      setRemarkImages([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
       const checked = (e.target as HTMLInputElement).checked;
       setFormData(prev => ({ ...prev, [name]: checked }));
       return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'stockQuantity' || name === 'commissionRate' || name === 'selectionCount' || name === 'procurementPrice'
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handlePlatformToggle = (platform: Platform) => {
    setFormData(prev => {
      const currentPlatforms = prev.platform as Platform[];
      if (currentPlatforms.includes(platform)) {
        return { ...prev, platform: currentPlatforms.filter(p => p !== platform) };
      } else {
        return { ...prev, platform: [...currentPlatforms, platform] };
      }
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, imageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemarkImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setRemarkImages(prev => [...prev, result]);
        };
        // Cast file to Blob to fix TypeScript error where inferred type is unknown
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeRemarkImage = (index: number) => {
    setRemarkImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = initialData?.id || Math.random().toString(36).substr(2, 9);
    onSave({ 
      id, 
      ...formData, 
      imageUrl: previewImage || 'https://picsum.photos/200/200',
      remarkImages: remarkImages
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? '编辑样品信息' : '样品入库登记'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <form id="sample-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Section 1: Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">基础信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-start space-x-6">
                  <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden relative group cursor-pointer hover:border-blue-400 transition-colors">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-1" />
                    ) : (
                      <>
                        <Upload size={24} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-400">点击上传图片</span>
                      </>
                    )}
                    <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                  </div>
                  <div className="flex-1 space-y-4">
                     <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">厂家品牌名称</label>
                      <input 
                        type="text" 
                        name="brandName" 
                        value={formData.brandName} 
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        placeholder="请输入品牌名称"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">产品名称 <span className="text-red-500">*</span></label>
                      <input 
                        required
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                        placeholder="请输入完整产品名称"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">所属分类</label>
                        <select 
                          name="category" 
                          value={formData.category} 
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                          {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">规格</label>
                        <input 
                          type="text" 
                          name="specs" 
                          value={formData.specs} 
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                          placeholder="如：500ml / 红色L码"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Warehouse Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">库存位置信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">货架位置编码 <span className="text-red-500">*</span></label>
                  <input 
                    required
                    type="text" 
                    name="locationCode" 
                    value={formData.locationCode} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono" 
                    placeholder="例如: A-01-05"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
                  <input 
                    type="number" 
                    name="stockQuantity" 
                    value={formData.stockQuantity} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">入库时间</label>
                  <input 
                    type="date" 
                    name="entryDate" 
                    value={formData.entryDate} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">快递单号</label>
                  <input 
                    type="text" 
                    name="trackingNumber" 
                    value={formData.trackingNumber || ''} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="入库快递单号"
                  />
                </div>
              </div>
            </div>

             {/* Section 3: Business & Merchant Info */}
             <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">商务与商家信息</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">集采价 (¥)</label>
                  <div className="relative">
                     <span className="absolute left-3 top-2 text-gray-500">¥</span>
                     <input 
                      type="number" 
                      name="procurementPrice" 
                      value={formData.procurementPrice || 0} 
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="0.00"
                    />
                  </div>
                  <div className="mt-2 flex items-center">
                    <input 
                      type="checkbox" 
                      id="includeShippingFee"
                      name="includeShippingFee" 
                      checked={formData.includeShippingFee || false} 
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                    />
                    <label htmlFor="includeShippingFee" className="ml-2 text-sm text-gray-600">集采是否含运费</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">商务对接人</label>
                  <input 
                    type="text" 
                    name="businessContact" 
                    value={formData.businessContact} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="公司内部对接人"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">商家对接人</label>
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      name="merchantContact" 
                      value={formData.merchantContact} 
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="品牌方联系人"
                    />
                     <input 
                      type="text" 
                      name="merchantPhone" 
                      value={formData.merchantPhone} 
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                      placeholder="联系电话"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Live Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">直播核心参数</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">直播价 (¥)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">¥</span>
                    <input 
                      type="number" 
                      name="price" 
                      value={formData.price} 
                      onChange={handleChange}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                  </div>
                   <div className="mt-2 flex items-center">
                    <input 
                      type="checkbox" 
                      id="isFreeShipping"
                      name="isFreeShipping" 
                      checked={formData.isFreeShipping} 
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
                    />
                    <label htmlFor="isFreeShipping" className="ml-2 text-sm text-gray-600">直播是否包邮</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">佣金率 (%)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      name="commissionRate" 
                      value={formData.commissionRate} 
                      onChange={handleChange}
                      className="w-full pl-4 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
                
                {/* Platform Multi-select */}
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">直播平台 (可多选)</label>
                   <div className="flex flex-wrap gap-2">
                     {PLATFORM_OPTIONS.map(p => (
                       <button
                         key={p}
                         type="button"
                         onClick={() => handlePlatformToggle(p)}
                         className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                           (formData.platform as Platform[]).includes(p)
                             ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                             : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                         }`}
                       >
                         {p}
                       </button>
                     ))}
                   </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">直播机制</label>
                  <input 
                    type="text" 
                    name="mechanism" 
                    value={formData.mechanism} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="例如: 拍一发三，送同款小样"
                  />
                </div>
                 <div>
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">助播</label>
                        <input 
                          type="text" 
                          name="assistantAnchor" 
                          value={formData.assistantAnchor} 
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                          placeholder="姓名"
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">历史被选</label>
                        <input 
                          type="number" 
                          name="selectionCount" 
                          value={formData.selectionCount} 
                          onChange={handleChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                        />
                     </div>
                   </div>
                </div>
              </div>
            </div>

            {/* Section 5: Remarks (New) */}
            <div>
               <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">备注信息</h3>
               <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">备注说明 (支持链接)</label>
                    <textarea 
                      name="remarks"
                      value={formData.remarks || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      placeholder="填写样品相关备注，如质检说明、注意事项等。输入网址可自动识别。"
                    />
                 </div>
                 
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">附件图片</label>
                    <div className="flex flex-wrap gap-4">
                      {remarkImages.map((img, index) => (
                        <div key={index} className="w-24 h-24 relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <img src={img} alt={`Remark ${index}`} className="w-full h-full object-contain p-1" />
                          <button 
                            type="button"
                            onClick={() => removeRemarkImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                      ))}
                      
                      <div className="w-24 h-24 relative border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50 hover:bg-white">
                        <Plus size={24} className="text-gray-400" />
                        <span className="text-[10px] text-gray-400 mt-1">添加图片</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleRemarkImageUpload}
                        />
                      </div>
                    </div>
                 </div>
               </div>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button 
            type="submit" 
            form="sample-form"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md transition-all flex items-center space-x-2"
          >
            <Save size={18} />
            <span>保存入库</span>
          </button>
        </div>
      </div>
    </div>
  );
};