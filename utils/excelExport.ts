import ExcelJS from 'exceljs';
import FileSaver from 'file-saver';
import { Sample } from '../types';

// Helper function to fetch image data and determine extension
const getImageData = async (url: string): Promise<{ buffer: ArrayBuffer, extension: 'png' | 'jpeg' | 'gif' } | null> => {
  try {
    // 1. Handle Base64 Data URIs
    if (url.startsWith('data:image')) {
      const split = url.split(',');
      const typeMatch = split[0].match(/:(.*?);/);
      const mime = typeMatch ? typeMatch[1] : 'image/png';
      
      let extension: 'png' | 'jpeg' | 'gif' = 'png';
      if (mime.includes('jpeg') || mime.includes('jpg')) extension = 'jpeg';
      if (mime.includes('gif')) extension = 'gif';

      const base64Data = split[1];
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return { buffer: bytes.buffer, extension };
    }

    // 2. Handle External URLs
    // Note: This requires the server to support CORS (Cross-Origin Resource Sharing).
    const response = await fetch(url, { mode: 'cors' });
    
    if (!response.ok) {
      console.warn(`Excel Export: Failed to fetch image ${url}. Status: ${response.status}`);
      return null;
    }

    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    
    let extension: 'png' | 'jpeg' | 'gif' = 'png';
    if (blob.type.includes('jpeg') || blob.type.includes('jpg')) extension = 'jpeg';
    if (blob.type.includes('gif')) extension = 'gif';
    
    // Fallback if blob type is generic but url has extension
    if (url.toLowerCase().endsWith('.jpg') || url.toLowerCase().endsWith('.jpeg')) extension = 'jpeg';

    return { buffer, extension };

  } catch (error) {
    console.warn('Excel Export: Error loading image', url, error);
    return null;
  }
};

export const exportSamplesToExcel = async (samples: Sample[], fileName: string = 'LiveWMS_Export') => {
  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('样品清单');

  // Define Columns
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: '产品图片', key: 'image', width: 18 }, // Slightly wider for padding
    { header: '产品名称', key: 'name', width: 30 },
    { header: '品牌', key: 'brandName', width: 15 },
    { header: '分类', key: 'category', width: 15 },
    { header: '货架位置', key: 'locationCode', width: 15 },
    { header: '库存', key: 'stockQuantity', width: 10 },
    { header: '直播价', key: 'price', width: 12 },
    { header: '佣金率', key: 'commissionRate', width: 10 },
    { header: '机制', key: 'mechanism', width: 25 },
    { header: '平台', key: 'platform', width: 20 },
    { header: '规格', key: 'specs', width: 15 },
    { header: '入库时间', key: 'entryDate', width: 15 },
    { header: '快递单号', key: 'trackingNumber', width: 20 },
    { header: '商务对接', key: 'businessContact', width: 15 },
    { header: '商家对接', key: 'merchantContact', width: 15 },
    { header: '商家电话', key: 'merchantPhone', width: 15 },
    { header: '备注', key: 'remarks', width: 30 },
  ];

  // Header Styling
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' } // Blue-600
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
  headerRow.height = 30;
  
  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Process Rows
  for (const sample of samples) {
    const row = worksheet.addRow({
      id: sample.id,
      name: sample.name,
      brandName: sample.brandName,
      category: sample.category,
      locationCode: sample.locationCode,
      stockQuantity: sample.stockQuantity,
      price: sample.price,
      commissionRate: `${sample.commissionRate}%`,
      mechanism: sample.mechanism,
      platform: sample.platform.join(', '),
      specs: sample.specs,
      entryDate: sample.entryDate,
      trackingNumber: sample.trackingNumber,
      businessContact: sample.businessContact,
      merchantContact: sample.merchantContact,
      merchantPhone: sample.merchantPhone,
      remarks: sample.remarks || ''
    });

    // Set fixed row height for image consistency
    row.height = 90; 
    row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

    // Process Image Embedding and Hyperlink
    if (sample.imageUrl) {
      const imageCell = row.getCell('image');
      
      // Add HYPERLINK formula
      imageCell.value = {
        formula: `HYPERLINK("${sample.imageUrl}", "查看图片")`
      };
      
      // Style the link text (Blue, Underline)
      imageCell.font = {
        color: { argb: 'FF0000FF' },
        underline: true,
        size: 10
      };
      // Align bottom-center to separate from the image (which is top-anchored)
      imageCell.alignment = { vertical: 'bottom', horizontal: 'center' };

      const imageData = await getImageData(sample.imageUrl);
      
      if (imageData) {
        const imageId = workbook.addImage({
          buffer: imageData.buffer,
          extension: imageData.extension,
        });

        // Determine precise position
        // row.number is 1-based. To target the row we just added:
        // Top-left anchor uses 0-based index. 
        // e.g., Row 1 (Header) is index 0. Row 2 (Data) is index 1.
        const rowIndex = row.number - 1; 

        worksheet.addImage(imageId, {
          // col: 1 targets the 'image' column (2nd column, index 1)
          // Adding 0.1 padding to center it slightly
          tl: { col: 1 + 0.1, row: rowIndex + 0.1 },
          // Reduced height slightly (80->70) to leave room for the "查看图片" text at the bottom
          ext: { width: 80, height: 70 }, 
          editAs: 'oneCell' // Ensures image moves with cells but doesn't resize unexpectedly
        });
      }
      // If image fails, the cell will still show the "查看图片" link
    } else {
      row.getCell('image').value = '无图';
      row.getCell('image').alignment = { vertical: 'middle', horizontal: 'center' };
    }
  }

  // Generate and Save
  const buffer = await workbook.xlsx.writeBuffer();
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  FileSaver.saveAs(blob, `${fileName}_${dateStr}.xlsx`);
};