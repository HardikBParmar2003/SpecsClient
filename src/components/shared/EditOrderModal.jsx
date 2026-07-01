import React, { useState } from 'react';
import { HiX, HiOutlineSave } from 'react-icons/hi';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import PrescriptionForm from './PrescriptionForm';
import CustomSelect from './CustomSelect';

const EditOrderModal = ({ order, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: order.status,
    pay_status: order.pay_status || 'pending',
    frame_price: order.frame_price || 0,
    glass_price: order.glass_price || 0,
    discount: order.discount || 0,
    advance: order.advance || 0,
    bill_number: order.bill_number || ''
  });

  const [orderItems, setOrderItems] = useState(() => {
    if (!order.order_items) return [];
    return order.order_items;
  });

  const [prescriptions, setPrescriptions] = useState(
    order.eye_prescriptions && order.eye_prescriptions.length > 0
      ? JSON.parse(JSON.stringify(order.eye_prescriptions))
      : []
  );

  const [isSaving, setIsSaving] = useState(false);

  const isWalkIn = true; // Forcing true since all editable POS orders are walk-ins
  const framePriceVal = parseFloat(formData.frame_price) || 0;
  const glassPriceVal = parseFloat(formData.glass_price) || 0;
  const discountVal = parseFloat(formData.discount) || 0;
  const advanceVal = parseFloat(formData.advance) || 0;

  const manualSubtotal = (framePriceVal > 0 || glassPriceVal > 0) ? (framePriceVal + glassPriceVal) : (() => {
    if (orderItems && orderItems.length > 0) {
      return orderItems.reduce((sum, item) => sum + (parseFloat(item.unit_price) || 0) * (parseInt(item.quantity) || 1), 0);
    }
    return (parseFloat(order.amount) || parseFloat(order.total_price) || 0) + discountVal;
  })();

  const calculatedTotal = manualSubtotal - discountVal;
  const balance = Math.max(0, calculatedTotal - advanceVal);

  const handleItemChange = (index, field, value) => {
    const newItems = [...orderItems];
    newItems[index][field] = value;
    setOrderItems(newItems);
  };

  const handleSave = async () => {
    if (advanceVal > calculatedTotal) {
      toast.error("Advance amount cannot be greater than the Final Total.");
      return;
    }
    setIsSaving(true);
    try {
      const itemsToSave = [...orderItems];
      if (itemsToSave.length > 0 && isWalkIn) {
        itemsToSave[0].unit_price = manualSubtotal;
      }

      const payload = {
        ...formData,
        frame_price: framePriceVal,
        glass_price: glassPriceVal,
        discount: discountVal,
        advance: advanceVal,
        amount: calculatedTotal,
        bill_number: formData.bill_number,
        order_items: itemsToSave,
        eye_prescriptions: prescriptions
      };
      
      const { data } = await api.put(`/orders/${order.id}`, payload);
      if (data.success) {
        toast.success('Order updated successfully!');
        onUpdate();
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div>
            <h2 className="text-lg uppercase tracking-widest text-luxury-gold">
              Edit Order {order.bill_number && <span className="text-[var(--text-muted)] ml-2 border-l border-[var(--border-color)] pl-2">Bill No: {order.bill_number}</span>}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Make corrections to order details</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-luxury-gold text-black uppercase tracking-widest text-xs font-bold px-4 py-2 rounded hover:bg-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <HiOutlineSave className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-2 cursor-pointer">
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            
            {/* LEFT COLUMN: Main Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Prescriptions */}
              <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
                <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3 mb-6">
                  <h3 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)]">Eye Prescriptions</h3>
                  {prescriptions.length === 0 && (
                    <button 
                      onClick={() => setPrescriptions([{ od_sphere: '', od_cylinder: '', od_axis: '', od_add: '', od_pd: '', os_sphere: '', os_cylinder: '', os_axis: '', os_add: '', os_pd: '' }])}
                      className="text-xs bg-luxury-gold/10 px-3 py-1.5 rounded text-luxury-gold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors cursor-pointer font-medium"
                    >
                      + Add Prescription
                    </button>
                  )}
                </div>
                {prescriptions.length > 0 ? (
                  prescriptions.map((p, idx) => (
                    <div key={idx} className="mb-6 last:mb-0">
                       <PrescriptionForm 
                         prescription={p} 
                         setPrescription={(newP) => {
                           const newPrescriptions = [...prescriptions];
                           newPrescriptions[idx] = newP;
                           setPrescriptions(newPrescriptions);
                         }} 
                       />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[var(--text-muted)] text-sm">No prescriptions added for this order.</div>
                )}
              </div>

              {/* Order Items */}
              <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
                <h3 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-3 mb-6">Order Items</h3>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 border border-[var(--border-color)] rounded-lg bg-[var(--bg-card)]">
                      <div className="md:col-span-2">
                        <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Description / Frame Name</label>
                        <input 
                          type="text" 
                          value={item.custom_frame_name || item.product_name || ''} 
                          onChange={(e) => handleItemChange(index, 'custom_frame_name', e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2.5 text-sm text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Glass Type</label>
                        <input 
                          type="text" 
                          value={item.glass_type || ''} 
                          onChange={(e) => handleItemChange(index, 'glass_type', e.target.value)}
                          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2.5 text-sm text-[var(--input-text)] focus:outline-none focus:border-luxury-gold transition-colors"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Settings & Summary Sidebar */}
            <div className="space-y-8">
              {/* Status Settings */}
              <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)] relative z-20 overflow-visible">
                <h3 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-3 mb-6">Order Status</h3>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Status</label>
                    <CustomSelect 
                      name="status"
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      options={[
                        {value: "pending", label: "Pending"},
                        {value: "processing", label: "Processing"},
                        {value: "completed", label: "Completed"},
                        {value: "cancelled", label: "Cancelled"}
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Payment Status</label>
                    <CustomSelect 
                      name="pay_status"
                      value={formData.pay_status} 
                      onChange={(e) => setFormData({...formData, pay_status: e.target.value})}
                      options={[
                        {value: "pending", label: "Pending"},
                        {value: "completed", label: "Completed"},
                        {value: "partially", label: "Partially"}
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Bill Number</label>
                    <input type="text" name="bill_number" value={formData.bill_number} onChange={(e) => setFormData({...formData, bill_number: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors" />
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-luxury-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.05)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-luxury-gold to-yellow-600"></div>
                <h3 className="text-sm font-bold tracking-widest uppercase text-luxury-gold border-b border-[var(--border-color)] pb-3 mb-6">Financial Summary</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Frame Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.frame_price} 
                      onChange={(e) => setFormData({...formData, frame_price: e.target.value})}
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Glass Price (₹)</label>
                    <input 
                      type="number" 
                      value={formData.glass_price} 
                      onChange={(e) => setFormData({...formData, glass_price: e.target.value})}
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Subtotal (₹)</label>
                    <div className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-muted)] opacity-70">
                      {manualSubtotal.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Discount (₹)</label>
                    <input 
                      type="number" 
                      value={formData.discount} 
                      onChange={(e) => setFormData({...formData, discount: e.target.value})}
                      className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Advance (₹)</label>
                    <input 
                      type="number" 
                      value={formData.advance} 
                      onChange={(e) => setFormData({...formData, advance: e.target.value})}
                      className={`w-full bg-[var(--input-bg)] border rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none transition-colors ${advanceVal > calculatedTotal ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-color)] focus:border-luxury-gold'}`}
                    />
                    {advanceVal > calculatedTotal && <p className="text-red-500 text-xs mt-1">Advance exceeds final total!</p>}
                  </div>
                </div>

                <div className="pt-5 border-t border-[var(--border-color)]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Total</span>
                    <span className="text-lg font-medium text-[var(--text-primary)]">₹{calculatedTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-[var(--border-color)] border-dashed">
                    <span className="text-xs uppercase tracking-widest text-luxury-gold">Balance Due</span>
                    <span className="text-3xl font-light text-luxury-gold">₹{balance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default EditOrderModal;
