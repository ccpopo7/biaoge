import React from 'react';
import { Search, Filter, Calendar, LayoutGrid } from 'lucide-react';
import { Category, Platform, SampleFilter } from '../types';
import { CATEGORY_OPTIONS, PLATFORM_OPTIONS } from '../constants';

interface FilterBarProps {
  filter: SampleFilter;
  setFilter: React.Dispatch<React.SetStateAction<SampleFilter>>;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filter, setFilter }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
      
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="搜索样品名称、货架号、或机制..."
          value={filter.search}
          onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
        />
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
        {/* Category Dropdown */}
        <div className="relative min-w-[140px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LayoutGrid size={16} className="text-gray-500" />
          </div>
          <select
            value={filter.category}
            onChange={(e) => {
              const val = e.target.value as Category | 'All';
              setFilter(prev => ({ ...prev, category: val }));
            }}
            className="block w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer hover:border-gray-400 transition-colors"
          >
            <option value="All">全部分类</option>
            {CATEGORY_OPTIONS.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Platform Dropdown */}
        <div className="relative min-w-[130px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter size={16} className="text-gray-500" />
          </div>
          <select
             value={filter.platform}
             onChange={(e) => {
               const val = e.target.value as Platform | 'All';
               setFilter(prev => ({ ...prev, platform: val }));
             }}
             className="block w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer hover:border-gray-400 transition-colors"
          >
            <option value="All">全部平台</option>
            {PLATFORM_OPTIONS.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
           <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>

        {/* Date Filter */}
         <div className="relative min-w-[130px]">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar size={16} className="text-gray-500" />
          </div>
          <select
             value={filter.dateRange}
             onChange={(e) => {
               const val = e.target.value as SampleFilter['dateRange'];
               setFilter(prev => ({ ...prev, dateRange: val }));
             }}
             className="block w-full pl-9 pr-8 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white cursor-pointer hover:border-gray-400 transition-colors"
          >
            <option value="All">全部时间</option>
            <option value="Today">今天入库</option>
            <option value="Week">本周入库</option>
            <option value="Month">本月入库</option>
          </select>
           <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
};