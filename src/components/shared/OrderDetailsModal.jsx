import React, { useRef, useState } from 'react';
import { HiX, HiOutlinePencil, HiOutlineDownload, HiOutlineShare } from 'react-icons/hi';
import PdfGenerator from '../../templates/PdfGenerator';
import toast from 'react-hot-toast';
import { shopConfig } from '../../config/shop';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../services/db';

const OrderDetailsModal = ({ order, onClose, onEdit }) => {
  const dbSettings = useLiveQuery(() => db.settings.where({ key: 'shopSettings' }).first());
  const customShopConfig = dbSettings?.value ? { ...shopConfig, ...dbSettings.value } : shopConfig;
  const pdfRef = useRef();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (pdfRef.current) {
      setIsGeneratingPdf(true);
      const toastId = toast.loading('Generating PDF...');
      const result = await pdfRef.current.generatePdf();
      if (result.success) {
        toast.success('PDF ready to save or share!', { id: toastId, duration: 4000 });
      } else {
        toast.error('Failed to generate PDF', { id: toastId });
      }
      setIsGeneratingPdf(false);
    }
  };

  if (!order) return null;

  // Calculate values
  const framePrice = parseFloat(order.fabric_price || 0);
  const glassPrice = parseFloat(order.stitching_price || 0);
  const discount = parseFloat(order.discount || 0);
  const advance = parseFloat(order.advance || 0);
  const advanceOnline = parseFloat(order.advance_online || 0);
  const totalAdvance = advance + advanceOnline;
  
  // Use order.amount if available (from AdminDashboard/AdminOrders), else order.total_price (AdminCustomerOrders)
  const finalTotal = parseFloat(order.amount !== undefined ? order.amount : order.total_price || 0);

  // According to user: "total as specs cost frame cost plus glass cost that one field of total or sub total whatever"
  // Let's call it "Sub Total"
  // If framePrice + glassPrice > 0, we can use that, otherwise if there's no frame/glass price but there are items, 
  // we could just fallback to finalTotal + discount.
  const calculatedSubTotal = framePrice + glassPrice;
  const subTotal = calculatedSubTotal > 0 ? calculatedSubTotal : (finalTotal + discount);
  const balance = Math.max(0, finalTotal - totalAdvance);

  let phone = order.mobile || order.customer_mobile || order.customerMobile;
  if (!phone && order.user) phone = order.user.mobile;
  let formattedPhone = phone ? phone.toString().replace(/\D/g, '') : '';
  if (formattedPhone.length === 10) formattedPhone = `91${formattedPhone}`;
  
  const customerNameStr = order.customerName || 'Customer';
  let garmentsArr = [];
  if (order.shirt_qty) garmentsArr.push(`${order.shirt_qty} Shirt(s)`);
  if (order.pant_qty) garmentsArr.push(`${order.pant_qty} Pant(s)`);
  
  let garmentsText = garmentsArr.length > 0 ? garmentsArr.join(', ') : 'Custom Tailoring';
  
  const messageText = encodeURIComponent(`✨ Greetings from ${customShopConfig.shopName || customShopConfig.shortName}! ✨\n\nHello M/s ${customerNameStr},\nThank you for trusting us with your custom tailoring! Here is the summary of your stitching order:\n\n👕 Garments: ${garmentsText}\n💰 Total Amount: ₹${finalTotal.toFixed(2)}\n💳 Advance Paid: ₹${totalAdvance.toFixed(2)}\n⏳ Balance Due: ₹${balance.toFixed(2)}\n\nWe look forward to delivering your perfect fit! 🪡✨`);
  
  const whatsappUrl = formattedPhone ? `https://wa.me/${formattedPhone}?text=${messageText}` : '#';


  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <PdfGenerator ref={pdfRef} order={order} />
      <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-5 sm:p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)] relative">
          <div className="pr-10">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold leading-tight">
                Order Details
              </h2>
              {order.bill_number && (
                <span className="text-[var(--text-muted)] text-sm sm:border-l sm:border-[var(--border-color)] sm:pl-2">
                  Bill No: <span className="font-medium whitespace-nowrap">{order.bill_number}</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 bg-[var(--input-bg)]/50 w-fit px-3 py-1.5 rounded-lg border border-[var(--border-color)]/50">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">Order Date</span>
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {order.order_date ? new Date(order.order_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="w-px h-6 bg-[var(--border-color)]/50"></div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase tracking-widest text-[var(--text-muted)]">Delivery Date</span>
                <span className="text-xs text-[var(--text-primary)] font-medium">
                  {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Not set'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => { if (!formattedPhone) { e.preventDefault(); toast.error('Mobile number not found'); } }}
              className="flex-1 sm:flex-none justify-center text-green-500 hover:text-green-400 transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-green-500/10 px-3 py-2 rounded-md leading-none"
              title="Share on WhatsApp Web"
            >
              <HiOutlineShare className="w-4 h-4" /> WA Web
            </a>
            <button 
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex-1 sm:flex-none justify-center text-blue-500 hover:text-blue-400 transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-blue-500/10 px-3 py-2 rounded-md disabled:opacity-50 leading-none"
            >
              <HiOutlineDownload className="w-4 h-4" /> PDF
            </button>
            <button 
              onClick={onEdit} 
              className="flex-1 sm:flex-none justify-center text-luxury-gold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-luxury-gold/10 px-3 py-2 rounded-md"
            >
              <HiOutlinePencil className="w-4 h-4" /> Edit
            </button>
          </div>

          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer bg-[var(--bg-primary)] sm:bg-transparent rounded-full p-1 sm:p-0 z-10 shadow-sm sm:shadow-none"
          >
            <HiX className="w-6 h-6 sm:w-6 sm:h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
            <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {order.photo ? (
                  <img src={order.photo} alt="Reference" className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-[var(--border-color)] shadow-sm flex-shrink-0" />
                ) : order.customerName ? (
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold text-lg flex-shrink-0">
                    {order.customerName.charAt(0).toUpperCase()}
                  </div>
                ) : null}
                <div>
                  <h3 className="text-[var(--text-primary)] font-medium text-base">{order.customerName}</h3>
                  <p className="text-[var(--text-muted)] text-xs mt-0.5">{order.mobile || order.customer_mobile}</p>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <span className={`inline-flex items-center justify-center leading-none px-3 py-1.5 rounded text-xs uppercase tracking-widest font-bold ${
                  order.status === 'completed' ? 'bg-green-500/20 text-green-400' : 
                  order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                  order.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {order.status}
                </span>

              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[var(--border-color)]">
              <div>
                <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest block mb-1">Payment Status</span>
                <span className={`text-sm font-medium uppercase ${order.pay_status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                  {order.pay_status || '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Order Quantities */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Order Quantities</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-center">
                    <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">Shirts</p>
                    <p className="text-[var(--text-primary)] text-xl font-medium">{order.shirt_qty || 0}</p>
                  </div>
                  <div className="p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg text-center">
                    <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-1">Pants</p>
                    <p className="text-[var(--text-primary)] text-xl font-medium">{order.pant_qty || 0}</p>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Financial Summary</h4>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-secondary)] text-sm">Total Amount</span>
                  <span className="text-xl font-medium text-[var(--text-primary)]">₹{finalTotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-secondary)] text-sm">Paid Amount</span>
                  <span className="text-green-400 text-sm">₹{totalAdvance.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)] border-dashed">
                  <span className="text-luxury-gold font-bold uppercase tracking-widest text-sm">Balance Due</span>
                  <span className="text-2xl font-light text-luxury-gold">₹{balance.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Measurement */}
            {order.measurements && order.measurements.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Body Measurements</h4>
                {order.measurements.map((p, idx) => (
                  <div key={idx} className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-5">
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      {/* Top / Shirt */}
                      <div>
                        <h5 className="text-luxury-gold text-[10px] uppercase tracking-widest mb-3 pb-1 border-b border-[var(--border-color)]">Top / Shirt</h5>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Length:</span> <span className="text-[var(--text-primary)]">{p.top_length || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Chest:</span> <span className="text-[var(--text-primary)]">{p.chest || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Waist:</span> <span className="text-[var(--text-primary)]">{p.top_waist || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Shoulder:</span> <span className="text-[var(--text-primary)]">{p.shoulder || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Sleeves:</span> <span className="text-[var(--text-primary)]">{p.sleeves || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Neck:</span> <span className="text-[var(--text-primary)]">{p.neck || '-'}</span></li>
                        </ul>
                      </div>
                      {/* Bottom / Trouser */}
                      <div>
                        <h5 className="text-luxury-gold text-[10px] uppercase tracking-widest mb-3 pb-1 border-b border-[var(--border-color)]">Bottom / Trouser</h5>
                        <ul className="space-y-2 text-sm">
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Length:</span> <span className="text-[var(--text-primary)]">{p.bottom_length || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Waist:</span> <span className="text-[var(--text-primary)]">{p.bottom_waist || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Hips:</span> <span className="text-[var(--text-primary)]">{p.hips || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Thigh:</span> <span className="text-[var(--text-primary)]">{p.thigh || '-'}</span></li>
                          <li className="flex justify-between"><span className="text-[var(--text-muted)]">Bottom:</span> <span className="text-[var(--text-primary)]">{p.bottom || '-'}</span></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
