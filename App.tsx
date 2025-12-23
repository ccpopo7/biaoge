import React, { useState, useMemo, useEffect } from 'react';
import { Plus, LayoutList, Grip, LogOut, User as UserIcon, FileSpreadsheet, Upload } from 'lucide-react';
import { Sample, SampleFilter, Platform, User } from './types';
import { MOCK_SAMPLES } from './constants';
import { SampleTable } from './components/SampleTable';
import { ShelfDistribution } from './components/ShelfDistribution';
import { FilterBar } from './components/FilterBar';
import { StatsCards } from './components/StatsCards';
import { SampleFormModal } from './components/SampleFormModal';
import { AuthPage } from './components/AuthPage';
import { exportSamplesToExcel } from './utils/excelExport';
import { ImportModal } from './components/ImportModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [samples, setSamples] = useState<Sample[]>(MOCK_SAMPLES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<Sample | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'shelf'>('list');
  const [isInitializing, setIsInitializing] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Check for persistent login
  useEffect(() => {
    const storedUser = localStorage.getItem('app_current_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('app_current_user');
      }
    }
    setIsInitializing(false);
  }, []);

  const [filter, setFilter] = useState<SampleFilter>({
    search: '',
    category: 'All',
    platform: 'All',
    dateRange: 'All'
  });

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('app_current_user');
    setUser(null);
  };

  const handleSaveSample = (newSample: Sample) => {
    if (editingSample) {
      setSamples(prev => prev.map(s => s.id === newSample.id ? newSample : s));
    } else {
      setSamples(prev => [newSample, ...prev]);
    }
  };

  const handleImportSamples = (newSamples: Sample[]) => {
    setSamples(prev => [...newSamples, ...prev]);
    // Optional: Show a success toast or alert
  };

  const handleDeleteSample = (id: string) => {
    if (confirm('确定要删除这个样品吗？此操作无法撤销。')) {
      setSamples(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleEditSample = (sample: Sample) => {
    setEditingSample(sample);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setEditingSample(null);
    setIsModalOpen(true);
  };

  // Filter Logic
  const filteredSamples = useMemo(() => {
    return samples.filter(sample => {
      // 1. Text Search (Name, Location, Specs, BrandName)
      const searchTerm = filter.search.toLowerCase();
      const matchesSearch = 
        sample.name.toLowerCase().includes(searchTerm) || 
        (sample.brandName && sample.brandName.toLowerCase().includes(searchTerm)) ||
        sample.locationCode.toLowerCase().includes(searchTerm) ||
        sample.mechanism.toLowerCase().includes(searchTerm) ||
        sample.specs.toLowerCase().includes(searchTerm);

      if (!matchesSearch) return false;

      // 2. Category
      if (filter.category !== 'All' && sample.category !== filter.category) return false;

      // 3. Platform (Check if array includes)
      if (filter.platform !== 'All' && !sample.platform.includes(filter.platform as Platform)) return false;

      // 4. Date Range
      if (filter.dateRange !== 'All') {
        const entryDate = new Date(sample.entryDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalized today
        
        if (filter.dateRange === 'Today') {
          const sampleDate = new Date(entryDate);
          sampleDate.setHours(0,0,0,0);
          if (sampleDate.getTime() !== today.getTime()) return false;
        } else if (filter.dateRange === 'Week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          if (entryDate < weekAgo) return false;
        } else if (filter.dateRange === 'Month') {
          const monthAgo = new Date(today);
          monthAgo.setDate(today.getDate() - 30);
          if (entryDate < monthAgo) return false;
        }
      }

      return true;
    });
  }, [samples, filter]);

  // Export Logic
  const handleExport = async (dataToExport: Sample[] = filteredSamples) => {
    if (dataToExport.length === 0) {
      alert('当前没有可导出的数据');
      return;
    }
    
    setIsExporting(true);
    try {
      await exportSamplesToExcel(dataToExport);
    } catch (error) {
      console.error('Export failed', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  if (isInitializing) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500 hidden sm:block">
                  直播选品仓储系统
                </h1>
                <h1 className="text-xl font-bold text-blue-700 sm:hidden">
                  LiveWMS
                </h1>
              </div>
            </div>
            
            {/* User Profile & Logout */}
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                 {user.avatar ? (
                   <img src={user.avatar} alt="User" className="w-6 h-6 rounded-full" />
                 ) : (
                   <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                     <UserIcon size={14} />
                   </div>
                 )}
                 <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
               </div>
               
               <div className="h-6 w-px bg-gray-200 mx-2"></div>
               
               <button 
                 onClick={handleLogout}
                 className="flex items-center text-gray-500 hover:text-red-600 font-medium text-sm transition-colors"
                 title="退出登录"
               >
                 <LogOut size={18} className="sm:mr-1" />
                 <span className="hidden sm:inline">退出</span>
               </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">样品总览</h2>
            <p className="text-sm text-gray-500 mt-1">管理所有直播间的样品库存、位置及直播机制数据。</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0 flex-wrap">
             <button 
              onClick={() => handleExport(filteredSamples)}
              disabled={isExporting}
              className={`inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isExporting ? 'opacity-70 cursor-wait' : 'hover:-translate-y-0.5'}`}
            >
              {isExporting ? (
                 <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                 <FileSpreadsheet size={18} className="mr-2 text-green-600" />
              )}
              {isExporting ? '导出中...' : '导出表格'}
            </button>
            
            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:-translate-y-0.5"
            >
              <Upload size={18} className="mr-2 text-blue-600" />
              导入Excel
            </button>

            <button 
              onClick={openNewModal}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:-translate-y-0.5"
            >
              <Plus size={18} className="mr-2" />
              新增样品入库
            </button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards samples={samples} />

        {/* Controls & Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <FilterBar filter={filter} setFilter={setFilter} />
          
          <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-auto mb-4 md:mb-0 shrink-0">
             <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <LayoutList size={16} className="mr-2" />
               样品列表
             </button>
             <button
              onClick={() => setViewMode('shelf')}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all ${viewMode === 'shelf' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
             >
               <Grip size={16} className="mr-2" />
               货架分布
             </button>
          </div>
        </div>

        {/* Table / Grid */}
        <div className="relative">
           <div className="absolute top-0 right-0 -mt-10 mb-2 text-xs text-gray-400 hidden md:block">
             共找到 {filteredSamples.length} 条记录
           </div>
           
           {viewMode === 'list' ? (
              <SampleTable 
                samples={filteredSamples} 
                onEdit={handleEditSample}
                onDelete={handleDeleteSample}
                onExport={(sample) => handleExport([sample])}
              />
           ) : (
              <ShelfDistribution samples={filteredSamples} />
           )}
        </div>

      </main>

      {/* Form Modal */}
      <SampleFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveSample}
        initialData={editingSample}
      />
      
      {/* Import Modal */}
      <ImportModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSamples}
      />
    </div>
  );
}