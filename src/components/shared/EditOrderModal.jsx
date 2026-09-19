import React, { useState } from 'react';
import { HiX, HiOutlineSave } from 'react-icons/hi';
import { db } from '../../services/db';
import { toast } from 'react-hot-toast';
import MeasurementForm from './MeasurementForm';
import CustomSelect from './CustomSelect';
import CustomDatePicker from './CustomDatePicker';

const EditOrderModal = ({ order, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: order.status,
    pay_status: order.pay_status || 'pending',
    total_amount: order.total_price || order.amount || 0,
    advance: order.advance || 0,
    bill_number: order.bill_number || '',
    customer_name: order.customer_name || order.customerName || '',
    shirt_qty: order.shirt_qty || 1,
    pant_qty: order.pant_qty || 1,
    order_date: order.order_date ? new Date(order.order_date) : order.created_at ? new Date(order.created_at) : null,
    delivery_date: order.delivery_date ? new Date(order.delivery_date) : null,
    photo: order.photo || ''
  });

  const [measurements, setMeasurements] = useState(
    order.measurements && order.measurements.length > 0
      ? JSON.parse(JSON.stringify(order.measurements))
      : []
  );

  const [isSaving, setIsSaving] = useState(false);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isWalkIn = true; // Forcing true since all editable POS orders are walk-ins
  const calculatedTotal = parseFloat(formData.total_amount) || 0;
  const advanceVal = parseFloat(formData.advance) || 0;
  const balance = Math.max(0, calculatedTotal - advanceVal);



  const handleSave = async () => {
    if (advanceVal > calculatedTotal) {
      toast.error("Advance amount cannot be greater than the Final Total.");
      return;
    }
    setIsSaving(true);
    try {
      const orderId = Number(order.id);
      const realOrder = await db.orders.get(orderId);
      
      await db.orders.update(orderId, {
        status: formData.status,
        pay_status: formData.pay_status,
        advance: advanceVal,
        total_price: calculatedTotal,
        bill_number: formData.bill_number,
        customer_name: formData.customer_name,
        shirt_qty: Number(formData.shirt_qty),
        pant_qty: Number(formData.pant_qty),
        order_date: formData.order_date,
        delivery_date: formData.delivery_date,
        photo: formData.photo,
        updated_at: new Date()
      });

      // Clear any old items if they exist
      await db.order_items.where({ order_id: orderId }).delete();

      // Overwrite measurements
      await db.measurements.where({ order_id: orderId }).delete();
      for (const p of measurements) {
        if (Object.keys(p).some(k => p[k] && String(p[k]).trim() !== '')) {
          await db.measurements.add({
            user_id: realOrder.user_id,
            order_id: orderId,
            ...p,
            measurement_date: new Date(),
            created_at: new Date()
          });
        }
      }

      toast.success('Order updated successfully!');
      onUpdate();
      onClose();
    } catch (err) {
      toast.error('Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 flex flex-col overflow-hidden">
      <div className="w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <div className="pr-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold leading-tight">
                Edit Order
              </h2>
              {order.bill_number && (
                <span className="text-[var(--text-muted)] text-sm sm:border-l sm:border-[var(--border-color)] sm:pl-2">
                  Bill No: <span className="font-medium whitespace-nowrap">{order.bill_number}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">Make corrections to order details</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-luxury-gold text-black uppercase tracking-widest text-xs font-bold px-4 py-2 rounded hover:bg-white transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <HiOutlineSave className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-2 cursor-pointer">
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Section 1: Order Photo */}
            <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] text-center shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2 text-left">1. Fabric / Reference Photo</h2>
              <div className="relative inline-block w-full max-w-sm mx-auto">
                {formData.photo ? (
                  <div className="relative">
                    <div className="rounded-xl overflow-hidden border-2 border-luxury-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                      <img src={formData.photo} alt="Order preview" className="w-full h-48 object-cover" />
                    </div>
                    <div className="flex justify-center gap-4 mt-4">
                      <label className="bg-luxury-gold/10 text-luxury-gold px-4 py-2 rounded uppercase tracking-widest text-xs font-bold hover:bg-luxury-gold hover:text-black transition-colors cursor-pointer">
                        Change Photo
                        <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                      <button type="button" onClick={() => setFormData({...formData, photo: ''})} className="bg-red-500/10 text-red-500 px-4 py-2 rounded uppercase tracking-widest text-xs font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer">
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[var(--border-color)] rounded-xl hover:border-luxury-gold hover:bg-luxury-gold/5 transition-colors cursor-pointer group">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-10 h-10 mb-3 text-[var(--text-muted)] group-hover:text-luxury-gold transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <p className="mb-2 text-sm text-[var(--text-secondary)] font-medium uppercase tracking-widest group-hover:text-luxury-gold transition-colors">Tap to Open Camera</p>
                      <p className="text-xs text-[var(--text-muted)]">or click to upload image</p>
                    </div>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Section 2: Customer Information */}
            <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
              <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">2. Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Customer Name</label>
                  <input type="text" name="customer_name" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Bill Number</label>
                  <input type="text" name="bill_number" value={formData.bill_number} onChange={(e) => setFormData({...formData, bill_number: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors" />
                </div>
              </div>
            </div>

            {/* Section 3: Order Details & Settings */}
            <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)] relative z-20">
              <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">3. Order Details & Settings</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Order Date</label>
                  <CustomDatePicker value={formData.order_date} onChange={(date) => setFormData({...formData, order_date: date})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Delivery Date</label>
                  <CustomDatePicker value={formData.delivery_date} onChange={(date) => setFormData({...formData, delivery_date: date})} />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Shirt Quantity</label>
                  <input type="number" min="0" value={formData.shirt_qty} onChange={(e) => setFormData({...formData, shirt_qty: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Pant Quantity</label>
                  <input type="number" min="0" value={formData.pant_qty} onChange={(e) => setFormData({...formData, pant_qty: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Order Status</label>
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
              </div>
            </div>

            {/* Section 4: Body Measurements */}
            <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
              <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2 mb-6">
                <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)]">4. Body Measurements</h2>
                {measurements.length === 0 && (
                  <button 
                    onClick={() => setMeasurements([{ }])}
                    className="text-xs bg-luxury-gold/10 px-3 py-1.5 rounded text-luxury-gold uppercase tracking-wider hover:bg-luxury-gold hover:text-black transition-colors cursor-pointer font-medium"
                  >
                    + Add Measurement
                  </button>
                )}
              </div>
              {measurements.length > 0 ? (
                measurements.map((p, idx) => (
                  <div key={idx} className="mb-6 last:mb-0">
                     <MeasurementForm 
                       measurement={p} 
                       setMeasurement={(newP) => {
                         const newMeasurements = [...measurements];
                         newMeasurements[idx] = newP;
                         setMeasurements(newMeasurements);
                       }} 
                     />
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-[var(--text-muted)] text-sm">No measurements added for this order.</div>
              )}
            </div>

            {/* Section 5: Billing Summary */}
            <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-luxury-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.05)] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-luxury-gold to-yellow-600"></div>
              <h2 className="text-sm font-bold tracking-widest uppercase text-luxury-gold border-b border-[var(--border-color)] pb-2 mb-6">5. Billing Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Amount (₹)</label>
                  <input 
                    type="number" 
                    value={formData.total_amount} 
                    onChange={(e) => setFormData({...formData, total_amount: e.target.value})}
                    className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Advance Amount</label>
                  <input 
                    type="number" 
                    value={formData.advance} 
                    onChange={(e) => setFormData({...formData, advance: e.target.value})}
                    className={`w-full bg-[var(--input-bg)] border rounded px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none transition-colors ${advanceVal > calculatedTotal ? 'border-red-500 focus:border-red-500' : 'border-[var(--border-color)] focus:border-luxury-gold'}`}
                  />
                </div>
                {advanceVal > calculatedTotal && <p className="text-red-500 text-xs mt-1 col-span-1 md:col-span-2">Advance amount exceeds final total!</p>}
                
                <div className="bg-[var(--input-bg)] p-4 rounded-lg border border-luxury-gold/20 col-span-1 md:col-span-2 flex justify-between items-center mt-4">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Total Amount</span>
                    <span className="text-xl font-light text-[var(--text-primary)]">₹{calculatedTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] text-luxury-gold">Balance Due</span>
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
