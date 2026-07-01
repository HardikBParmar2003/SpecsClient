import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { SHOP_CONFIG } from '../config/shopConfig';
import ShivnetraChashamagharInvoice from './ShivnetraChashamagharInvoice';

// Map of all available templates
const TEMPLATES = {
  ShivnetraChashamaghar: ShivnetraChashamagharInvoice,
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
          scale: 2, // better resolution
          useCORS: true,
          logging: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        
        const customerName = order.customerName || order.user?.name || 'Customer';
        const formattedName = customerName.replace(/\s+/g, '-');
        
        const orderDate = new Date(order.created_at || new Date());
        const day = String(orderDate.getDate()).padStart(2, '0');
        const month = String(orderDate.getMonth() + 1).padStart(2, '0');
        const year = orderDate.getFullYear();
        
        const fileName = `${formattedName}-${day}-${month}-${year}.pdf`;
        
        pdf.save(fileName);
        
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
