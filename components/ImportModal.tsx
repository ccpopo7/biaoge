import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Sample } from '../types';
import { parseExcelToSamples, generateTemplate } from '../utils/excelImport';
import FileSaver from 'file-saver';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (samples: Sample[]) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedCount, setParsedCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (uploadedFile: File) => {
    setError(null);
    setParsedCount(null);
    
    const validTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!validTypes.includes(uploadedFile.type) && !uploadedFile.name.endsWith('.xlsx') && !uploadedFile.name.endsWith('.xls')) {
      setError('请上传有效的 Excel 文件 (.xlsx 或 .xls)');
      return;
    }
    
    setFile(uploadedFile);
  };

  const handleDownloadTemplate = async () => {
    try {
        const buffer = await generateTemplate();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        FileSaver.saveAs(blob, '样品导入模板.xlsx');
    } catch (e) {
        console.error(e);
        setError('模板生成失败');
    }
  };

  const handleSubmit = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const samples = await parseExcelToSamples(file);
      if (samples.length === 0) {
        setError('未在文件中找到有效数据，请确保包含“产品名称”和“货架位置”列。');
      } else {
        setParsedCount(samples.length);
        // Small delay to show success state before closing/importing
        setTimeout(() => {
             onImport(samples);
             handleClose();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setError('文件解析失败，请检查文件格式是否正确。');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setParsedCount(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <FileSpreadsheet className="mr-2 text-blue-600" size={24} />
            批量导入样品
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
            
            {/* Template Download */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-100 flex justify-between items-center">
                <div>
                    <p className="text-sm font-medium text-blue-800">还没有数据格式？</p>
                    <p className="text-xs text-blue-600 mt-0.5">下载标准 Excel 模板以确保导入成功</p>
                </div>
                <button 
                    onClick={handleDownloadTemplate}
                    className="text-sm bg-white text-blue-600 px-3 py-1.5 rounded border border-blue-200 hover:bg-blue-50 transition-colors flex items-center shadow-sm"
                >
                    <Download size={14} className="mr-1" />
                    下载模板
                </button>
            </div>

            {/* Drop Zone */}
            {!parsedCount ? (
                <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                        isDragging 
                            ? 'border-blue-500 bg-blue-50' 
                            : file 
                                ? 'border-green-400 bg-green-50' 
                                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                >
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileSelect} 
                        className="hidden" 
                        accept=".xlsx, .xls"
                    />
                    
                    {file ? (
                        <>
                            <FileSpreadsheet size={48} className="text-green-500 mb-3" />
                            <p className="text-gray-900 font-medium">{file.name}</p>
                            <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                            <p className="text-xs text-green-600 mt-2 font-medium">点击更换文件</p>
                        </>
                    ) : (
                        <>
                            <Upload size={48} className="text-gray-300 mb-3" />
                            <p className="text-gray-700 font-medium">点击或拖拽上传 Excel 文件</p>
                            <p className="text-xs text-gray-400 mt-1">支持 .xlsx, .xls 格式</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">解析成功!</h3>
                    <p className="text-gray-600 mt-2">准备导入 <span className="font-bold text-green-600">{parsedCount}</span> 个样品</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center">
                    <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end space-x-3">
          <button 
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm"
          >
            取消
          </button>
          {!parsedCount && (
            <button 
                onClick={handleSubmit}
                disabled={!file || isProcessing}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md transition-all flex items-center text-sm ${
                    !file || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 hover:-translate-y-0.5'
                }`}
            >
                {isProcessing ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        处理中...
                    </>
                ) : (
                    <>
                        <Upload size={16} className="mr-2" />
                        开始导入
                    </>
                )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};