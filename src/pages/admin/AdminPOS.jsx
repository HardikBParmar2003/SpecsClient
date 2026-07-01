import { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import PrescriptionForm from '../../components/shared/PrescriptionForm';
import CustomSelect from '../../components/shared/CustomSelect';

const AdminPOS = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    frame_type: 'Full Rim',
    frame_name: '',
    frame_cost: 0,
    glass_type: '',
    glass_cost: 0,
    discount: 0,
    reminder_months: 12,
    status: 'completed',
    pay_status: 'completed',
    advance: 0,
    bill_number: ''
  });
  
  const [prescription, setPrescription] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const frameCost = parseFloat(formData.frame_cost) || 0;
  const glassCost = parseFloat(formData.glass_cost) || 0;
  const discount = parseFloat(formData.discount) || 0;
  const advance = parseFloat(formData.advance) || 0;
  const totalCost = frameCost + glassCost - discount;
  const balance = Math.max(0, totalCost - advance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (advance > totalCost) {
      toast.error("Advance amount cannot be greater than the Total Amount.");
      return;
    }
    try {
      const payload = {
        user: { name: formData.name, email: formData.email, mobile: formData.mobile },
        order: {
          frame_price: frameCost,
          glass_price: glassCost,
          discount: discount,
          total_price: totalCost,
          reminder_months: formData.reminder_months,
          payment_method: 'cash',
          status: formData.status,
          pay_status: formData.pay_status,
          advance: advance,
          bill_number: formData.bill_number
        },
        order_items: [{
          custom_frame_name: formData.frame_name,
          glass_type: formData.glass_type,
          unit_price: frameCost + glassCost,
          quantity: 1
        }],
        prescription: prescription
      };

      const { data } = await api.post('/orders/walk-in', payload);
      if (data.success) {
        toast.success('Walk-in order created successfully!');
        // Reset form
        setFormData({
          name: '', email: '', mobile: '', frame_type: 'Full Rim', frame_name: '',
          frame_cost: 0, glass_type: '', glass_cost: 0, discount: 0, advance: 0, reminder_months: 12,
          status: 'completed', pay_status: 'completed'
        });
        setPrescription({});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 border-b border-[var(--border-color)] pb-6">
        <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">Point of Sale</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Register new walk-in customer and generate order</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Customer Info */}
        <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">1. Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Mobile Number <span className="text-red-500">*</span></label>
              <input type="text" name="mobile" required value={formData.mobile} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            {/* <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div> */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Bill Number</label>
              <input type="text" name="bill_number" value={formData.bill_number} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
          </div>
        </div>

        {/* Section 2: Product & Cost Details */}
        <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] relative z-20">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">2. Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Frame Type</label>
              <CustomSelect 
                name="frame_type" 
                value={formData.frame_type} 
                onChange={handleChange} 
                options={[
                  {value: "Full Rim", label: "Full Rim"},
                  {value: "Half Rim", label: "Half Rim"},
                  {value: "Rimless", label: "Rimless"}
                ]}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Frame Name / Description</label>
              <input type="text" name="frame_name" value={formData.frame_name} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Glass Type</label>
              <input type="text" name="glass_type" placeholder="e.g. Single Vision Blue Cut" value={formData.glass_type} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Reminder Duration</label>
              <CustomSelect 
                name="reminder_months" 
                value={formData.reminder_months} 
                onChange={handleChange} 
                options={[
                  {value: 3, label: "3 Months"},
                  {value: 6, label: "6 Months"},
                  {value: 9, label: "9 Months"},
                  {value: 12, label: "12 Months"},
                  {value: 18, label: "18 Months"},
                  {value: 24, label: "24 Months"}
                ]}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Order Status</label>
              <CustomSelect 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
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
                onChange={handleChange} 
                options={[
                  {value: "pending", label: "Pending"},
                  {value: "completed", label: "Completed"},
                  {value: "partially", label: "Partially"}
                ]}
              />
            </div>
          </div>
        </div>

        {/* Section 4: Eye Prescription */}
        <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">3. Eye Prescription</h2>
          <PrescriptionForm prescription={prescription} setPrescription={setPrescription} />
        </div>

        {/* Section 3: Billing */}
        <div className="glassmorphism p-6 rounded-xl border border-luxury-gold/30 bg-luxury-gold/5">
          <h2 className="text-sm font-medium tracking-widest uppercase text-luxury-gold mb-6 border-b border-luxury-gold/20 pb-2">4. Billing Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Frame Cost (₹)</label>
              <input type="number" name="frame_cost" value={formData.frame_cost} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Glass Cost (₹)</label>
              <input type="number" name="glass_cost" value={formData.glass_cost} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Discount (₹)</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Advance (₹)</label>
              <input type="number" name="advance" value={formData.advance} onChange={handleChange} className={`w-full bg-[var(--input-bg)] border rounded px-4 py-2 text-[var(--input-text)] focus:outline-none transition-colors ${advance > totalCost ? 'border-red-500 focus:border-red-500' : 'border-[var(--input-border)] focus:border-luxury-gold'}`} />
              {advance > totalCost && <p className="text-red-500 text-xs mt-1">Advance exceeds total amount!</p>}
            </div>
            <div className="bg-[var(--input-bg)] p-4 rounded-lg border border-luxury-gold/20 col-span-1 md:col-span-4 flex flex-col sm:flex-row justify-between items-center mt-4">
              <div className="flex flex-col mb-4 sm:mb-0">
                <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Total Amount</span>
                <span className="text-xl font-light text-[var(--text-primary)]">₹{totalCost.toFixed(2)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] text-luxury-gold">Balance Due</span>
                <span className="text-2xl font-light text-luxury-gold">₹{balance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-luxury-gold text-black uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 px-12 py-4 rounded shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Complete Registration & Checkout
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminPOS;
