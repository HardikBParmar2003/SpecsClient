import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { SHOP_CONFIG } from '../config/shopConfig';
import ShivnetraChashamagharInvoice from './ShivnetraChashamagharInvoice';
import CityPalaxeInvoice from './CityPalaxeInvoice';

// Map of all available templates
const TEMPLATES = {
  ShivnetraChashamaghar: ShivnetraChashamagharInvoice,
  CityPalaxe: CityPalaxeInvoice,
  // add more templates here in the future
};

const PdfGenerator = forwardRef(({ order }, ref) => {
  const printRef = useRef();
  const [isGenerating, setIsGenerating] = useState(false);

  const ActiveTemplate = TEMPLATES[SHOP_CONFIG.activeTemplate];

  // Provide the generatePdf function to parent components via ref
  useImperativeHandle(ref, () => ({
    generatePdf: async () => {
      if (!printRef.current || !order) return null;
      setIsGenerating(true);
      
      try {
        const canvas = await html2canvas(printRef.current, {
          scale: 2, // High resolution for clear print & text
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 800
        });
        
        // Use JPEG format with quality 0.85 instead of uncompressed PNG (reduces file size from ~10MB to ~200KB)
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4',
          compress: true
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        if (pdfHeight > pageHeight && pdfHeight < pageHeight * 1.15) {
          // If invoice slightly exceeds A4 height, scale proportionally to fit cleanly on single page
          const scaleFactor = pageHeight / pdfHeight;
          const fittedWidth = pdfWidth * scaleFactor;
          const xOffset = (pdfWidth - fittedWidth) / 2;
          pdf.addImage(imgData, 'JPEG', xOffset, 0, fittedWidth, pageHeight, undefined, 'FAST');
        } else if (pdfHeight > pageHeight) {
          // Multi-page handling if invoice content is long
          let heightLeft = pdfHeight;
          let position = 0;
          pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
          heightLeft -= pageHeight;
          while (heightLeft > 0) {
            position -= pageHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;
          }
        } else {
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        }
        
        const customerName = order.customer_name || order.customerName || order.user?.name || 'Customer';
        const formattedName = customerName.replace(/\s+/g, '-');
        
        const orderDate = new Date(order.created_at || new Date());
        const day = String(orderDate.getDate()).padStart(2, '0');
        const month = String(orderDate.getMonth() + 1).padStart(2, '0');
        const year = orderDate.getFullYear();
        
        const fileName = `${formattedName}-${day}-${month}-${year}.pdf`;
        
        if (Capacitor.isNativePlatform()) {
          const pdfBase64 = pdf.output('datauristring').split(',')[1];
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: pdfBase64,
            directory: Directory.Cache
          });
          
          await Share.share({
            title: 'Invoice PDF',
            url: savedFile.uri,
            dialogTitle: 'Save or Share Invoice'
          });
        } else {
          pdf.save(fileName);
        }
        
        return { success: true };
      } catch (error) {
        console.error("PDF Generation Error:", error);
        return { success: false, error };
      } finally {
        setIsGenerating(false);
      }
    }
  }));

  if (!ActiveTemplate) {
    return <div className="hidden">Template not found</div>;
  }

  return (
    <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
      <div ref={printRef}>
        <ActiveTemplate order={order} />
      </div>
    </div>
  );
});

export default PdfGenerator;
