import ExcelJS from 'exceljs';
import { Sample, Category, Platform } from '../types';

// Map Excel Header Names to Sample Keys
const COLUMN_MAP: Record<string, keyof Sample | 'platformString'> = {
  '产品名称': 'name',
  '品牌': 'brandName',
  '分类': 'category',
  '货架位置': 'locationCode',
  '库存': 'stockQuantity',
  '直播价': 'price',
  '佣金率': 'commissionRate',
  '机制': 'mechanism',
  '平台': 'platformString', // Special handling for array
  '规格': 'specs',
  '入库时间': 'entryDate',
  '快递单号': 'trackingNumber',
  '商务对接': 'businessContact',
  '商家对接': 'merchantContact',
  '商家电话': 'merchantPhone',
  '备注': 'remarks',
  '图片链接': 'imageUrl' // Optional column for URL
};

// Helper to match string to Enum
const parseCategory = (value: string): Category => {
  const categories = Object.values(Category);
  return categories.includes(value as Category) ? (value as Category) : Category.Other;
};

// Helper to parse Platform string (e.g., "抖音, 快手")
const parsePlatforms = (value: string): Platform[] => {
  if (!value) return [];
  const validPlatforms = Object.values(Platform);
  // Split by comma or Chinese comma, trim whitespace
  const inputs = value.split(/[,，]/).map(s => s.trim());
  
  const result: Platform[] = [];
  inputs.forEach(input => {
    if (validPlatforms.includes(input as Platform)) {
      result.push(input as Platform);
    }
  });
  
  return result.length > 0 ? result : [Platform.Other];
};

export const parseExcelToSamples = async (file: File): Promise<Sample[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1); // Get first sheet
  if (!worksheet) throw new Error('Excel file is empty');

  const samples: Sample[] = [];
  const headerMap: Record<number, keyof Sample | 'platformString'> = {};

  // 1. Parse Headers (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    const headerText = cell.value?.toString().trim() || '';
    // Check if header exists in our map
    for (const [key, value] of Object.entries(COLUMN_MAP)) {
      if (headerText.includes(key)) {
        headerMap[colNumber] = value;
        break;
      }
    }
  });

  // 2. Parse Data (Rows 2+)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header

    const newSample: any = {
      id: Math.random().toString(36).substr(2, 9),
      selectionCount: 0,
      isFreeShipping: true, // Default
      includeShippingFee: false, // Default
      platform: [Platform.Douyin], // Default
      imageUrl: 'https://picsum.photos/200/200', // Default placeholder
      remarkImages: []
    };

    let hasData = false;

    row.eachCell((cell, colNumber) => {
      const field = headerMap[colNumber];
      if (field) {
        let value = cell.value;
        
        // Handle ExcelJS hyperlink objects
        if (typeof value === 'object' && value !== null && 'text' in value) {
            value = (value as any).text;
        }

        const stringValue = value?.toString().trim() || '';

        if (stringValue) hasData = true;

        switch (field) {
          case 'category':
            newSample.category = parseCategory(stringValue);
            break;
          case 'platformString':
            newSample.platform = parsePlatforms(stringValue);
            break;
          case 'stockQuantity':
          case 'selectionCount':
            newSample.stockQuantity = parseInt(stringValue) || 0;
            break;
          case 'price':
          case 'procurementPrice':
          case 'commissionRate':
             // Remove currency symbols if present
             const numStr = stringValue.replace(/[¥￥%]/g, '');
             newSample[field] = parseFloat(numStr) || 0;
             break;
          case 'entryDate':
             // Try to parse Excel date
             if (value instanceof Date) {
               newSample.entryDate = value.toISOString().split('T')[0];
             } else {
               // Try to parse string date
               const date = new Date(stringValue);
               if (!isNaN(date.getTime())) {
                 newSample.entryDate = date.toISOString().split('T')[0];
               } else {
                 newSample.entryDate = new Date().toISOString().split('T')[0];
               }
             }
             break;
          default:
            newSample[field] = stringValue;
        }
      }
    });

    // Simple validation: Needs a name and location
    if (hasData && newSample.name && newSample.locationCode) {
      samples.push(newSample as Sample);
    }
  });

  return samples;
};

export const generateTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('导入模板');
  
    // Define Columns matching COLUMN_MAP
    worksheet.columns = [
      { header: '产品名称 *', key: 'name', width: 25 },
      { header: '品牌', key: 'brandName', width: 15 },
      { header: '分类', key: 'category', width: 15 },
      { header: '货架位置 *', key: 'locationCode', width: 15 },
      { header: '库存', key: 'stockQuantity', width: 10 },
      { header: '直播价', key: 'price', width: 12 },
      { header: '佣金率', key: 'commissionRate', width: 10 },
      { header: '机制', key: 'mechanism', width: 20 },
      { header: '平台 (逗号分隔)', key: 'platform', width: 20 },
      { header: '规格', key: 'specs', width: 15 },
      { header: '入库时间 (YYYY-MM-DD)', key: 'entryDate', width: 20 },
      { header: '快递单号', key: 'trackingNumber', width: 20 },
      { header: '商务对接', key: 'businessContact', width: 15 },
      { header: '商家对接', key: 'merchantContact', width: 15 },
      { header: '商家电话', key: 'merchantPhone', width: 15 },
      { header: '备注', key: 'remarks', width: 30 },
      { header: '图片链接', key: 'imageUrl', width: 30 },
    ];
  
    // Style Header
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };
    
    // Add Example Row
    worksheet.addRow({
        name: '示例: 高保湿面霜',
        brandName: '示例品牌',
        category: '美妆护肤',
        locationCode: 'A-01-01',
        stockQuantity: 50,
        price: 299,
        commissionRate: 20,
        mechanism: '买一送一',
        platform: '抖音, 快手',
        specs: '50ml',
        entryDate: new Date().toISOString().split('T')[0],
        trackingNumber: 'SF123456789',
        businessContact: '小王',
        merchantContact: '李总',
        merchantPhone: '13800138000',
        remarks: '这是示例数据，请删除',
        imageUrl: 'https://example.com/image.jpg'
    });
  
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  };