import React, { useRef, useState } from 'react';
import { HiX, HiOutlinePencil, HiOutlineDownload, HiOutlineShare } from 'react-icons/hi';
import PdfGenerator from '../../templates/PdfGenerator';
import toast from 'react-hot-toast';

const OrderDetailsModal = ({ order, onClose, onEdit }) => {
  const pdfRef = useRef();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (pdfRef.current) {
      setIsGeneratingPdf(true);
      const toastId = toast.loading('Generating PDF...');
      const result = await pdfRef.current.generatePdf();
      if (result.success) {
        toast.success('PDF Downloaded Successfully', { id: toastId });
      } else {
        toast.error('Failed to generate PDF', { id: toastId });
      }
      setIsGeneratingPdf(false);
    }
  };

  if (!order) return null;

  // Calculate values
  const framePrice = parseFloat(order.frame_price || 0);
  const glassPrice = parseFloat(order.glass_price || 0);
  const discount = parseFloat(order.discount || 0);
  const advance = parseFloat(order.advance || 0);
  
  // Use order.amount if available (from AdminDashboard/AdminOrders), else order.total_price (AdminCustomerOrders)
  const finalTotal = parseFloat(order.amount !== undefined ? order.amount : order.total_price || 0);

  // According to user: "total as specs cost frame cost plus glass cost that one field of total or sub total whatever"
  // Let's call it "Sub Total"
  // If framePrice + glassPrice > 0, we can use that, otherwise if there's no frame/glass price but there are items, 
  // we could just fallback to finalTotal + discount.
  const calculatedSubTotal = framePrice + glassPrice;
  const subTotal = calculatedSubTotal > 0 ? calculatedSubTotal : (finalTotal + discount);
  const balance = Math.max(0, finalTotal - advance);

  let phone = order.mobile || order.customer_mobile || order.customerMobile;
  if (!phone && order.user) phone = order.user.mobile;
  let formattedPhone = phone ? phone.toString().replace(/\D/g, '') : '';
  if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;
  
  const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone}` : '#';


  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <PdfGenerator ref={pdfRef} order={order} />
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div>
            <h2 className="text-lg uppercase tracking-widest text-luxury-gold">
              Order Details {order.bill_number && <span className="text-[var(--text-muted)] ml-2 border-l border-[var(--border-color)] pl-2">Bill No: {order.bill_number}</span>}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { if (!formattedPhone) { e.preventDefault(); toast.error('Mobile number not found'); } }}
              className="text-green-500 hover:text-green-400 transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-green-500/10 px-3 py-1.5 rounded-md"
              title="Share on WhatsApp Web"
            >
              <HiOutlineShare className="w-4 h-4" /> WA Web
            </a>
            <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="text-blue-500 hover:text-blue-400 transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-blue-500/10 px-3 py-1.5 rounded-md disabled:opacity-50"
            >
              <HiOutlineDownload className="w-4 h-4" /> PDF
            </button>
            <button 
              onClick={onEdit} 
              className="text-luxury-gold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-luxury-gold/10 px-3 py-1.5 rounded-md"
            >
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </button>
            <button 
              onClick={onClose} 
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
              <div className="flex items-center gap-3">
                {order.customerName && (
                  <>
                    <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold text-lg">
                      {order.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[var(--text-primary)] font-medium text-base">{order.customerName}</h3>
                      <p className="text-[var(--text-muted)] text-xs">{order.mobile || order.customer_mobile}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className={`px-3 py-1 rounded text-xs uppercase tracking-widest font-bold ${
                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {order.status}
                </span>
                <span className="text-[var(--text-muted)] text-xs uppercase tracking-wider">
                  {(order.type || order.ord_type || '').replace('_', ' ')} Order
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
              <div>
                <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest block mb-1">Payment Method</span>
                <span className="text-[var(--text-primary)] text-sm font-medium uppercase">{order.pay_method || '-'}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest block mb-1">Payment Status</span>
                <span className={`text-sm font-medium uppercase ${order.pay_status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {order.pay_status || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.order_items && order.order_items.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Order Items</h4>
              <div className="space-y-3">
                {order.order_items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.product_image && <img src={item.product_image} alt="" className="w-10 h-10 rounded object-cover" />}
                      <div>
                        <p className="text-[var(--text-primary)] text-sm">{item.custom_frame_name || item.product?.name || item.product_name || 'Unknown Item'}</p>
                        {item.glass_type && <p className="text-[var(--text-muted)] text-xs mt-1">Glass: {item.glass_type}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[var(--text-primary)] text-sm">₹{item.unit_price}</p>
                      <p className="text-[var(--text-muted)] text-xs">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Eye Prescription */}
          {order.eye_prescriptions && order.eye_prescriptions.length > 0 && (
            <div className="mt-8">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Eye Prescription</h4>
              {order.eye_prescriptions.map((p, idx) => (
                <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-4 overflow-x-auto mb-4">
                  <table className="w-full text-xs text-center">
                    <thead className="text-[var(--text-muted)] border-b border-[var(--border-color)]">
                      <tr>
                        <th className="py-2 text-left">Eye</th>
                        <th className="py-2">SPH</th>
                        <th className="py-2">CYL</th>
                        <th className="py-2">AXIS</th>
                        <th className="py-2">ADD</th>
                        <th className="py-2">PD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      <tr>
                        <td className="py-3 text-left font-medium text-luxury-gold">Right (OD)</td>
                        <td className="py-3">{p.od_sphere || '-'}</td>
                        <td className="py-3">{p.od_cylinder || '-'}</td>
                        <td className="py-3">{p.od_axis || '-'}</td>
                        <td className="py-3">{p.od_add || '-'}</td>
                        <td className="py-3">{p.od_pd || '-'}</td>
                      </tr>
                      <tr>
                        <td className="py-3 text-left font-medium text-luxury-gold">Left (OS)</td>
                        <td className="py-3">{p.os_sphere || '-'}</td>
                        <td className="py-3">{p.os_cylinder || '-'}</td>
                        <td className="py-3">{p.os_axis || '-'}</td>
                        <td className="py-3">{p.os_add || '-'}</td>
                        <td className="py-3">{p.os_pd || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Financial Summary */}
          <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Financial Summary</h4>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--text-secondary)] text-sm">Frame Cost</span>
              <span className="text-[var(--text-primary)] text-sm">₹{parseFloat(order.frame_price || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--text-secondary)] text-sm">Glass Cost</span>
              <span className="text-[var(--text-primary)] text-sm">₹{parseFloat(order.glass_price || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--text-secondary)] text-sm">Sub Total (Specs Cost)</span>
              <span className="text-[var(--text-primary)] text-sm">₹{subTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--text-secondary)] text-sm">Discount</span>
              <span className="text-red-400 text-sm">-₹{discount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-[var(--text-secondary)] text-sm">Advance Paid</span>
              <span className="text-green-400 text-sm">-₹{advance.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
              <span className="text-[var(--text-primary)] font-bold uppercase tracking-widest text-sm">Final Total</span>
              <span className="text-xl font-medium text-[var(--text-primary)]">₹{finalTotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center mt-2 pt-2 border-t border-[var(--border-color)] border-dashed">
              <span className="text-luxury-gold font-bold uppercase tracking-widest text-sm">Balance Due</span>
              <span className="text-2xl font-light text-luxury-gold">₹{balance.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
