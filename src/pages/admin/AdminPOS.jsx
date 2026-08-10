import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import MeasurementForm from '../../components/shared/MeasurementForm';
import CustomSelect from '../../components/shared/CustomSelect';

const AdminPOS = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    outfit_type: 'Shirt',
    item_description: '',
    amount: 0,
    fabric_type: '',
    
    discount: 0,
    
    status: 'pending',
    pay_status: 'pending',
    
    
    bill_number: ''
  });
  
  const [measurement, setMeasurement] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const amount = parseFloat(formData.amount) || 0;
  
  const discount = parseFloat(formData.discount) || 0;
  
  
  const totalAdvance = 0;
  const totalCost = amount - discount;
  const balance = Math.max(0, totalCost - totalAdvance);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (totalAdvance > totalCost) {
      toast.error("Total advance amount cannot be greater than the Total Amount.");
      return;
    }
    try {
      // 1. Find or create user
      let customer = await db.users.where('mobile').equals(formData.mobile).first();
      if (!customer) {
        const userId = await db.users.add({
          name: formData.name,
          email: formData.email || '',
          mobile: formData.mobile,
          role: 'customer',
          cust_type: 'offline',
          created_at: new Date(),
          updated_at: new Date()
        });
        customer = await db.users.get(userId);
      }

      // 2. Create Order
      const orderId = await db.orders.add({
        user_id: customer.id,
        ord_type: 'walk-in',
        status: formData.status,
        frame_price: amount,
        glass_price: 0,
        discount: discount,
        total_price: totalCost,
        advance: 0,
        advance_online: 0,
        pay_status: formData.pay_status,
        pay_method: 'cash',
        bill_number: formData.bill_number,
        reminder_months: formData.reminder_months,
        reminder_date: new Date(new Date().setMonth(new Date().getMonth() + parseInt(formData.reminder_months))),
        created_at: new Date(),
        updated_at: new Date()
      });

      // 3. Create Order Item
      await db.order_items.add({
        order_id: orderId,
        custom_item_name: formData.item_description,
        fabric_type: formData.fabric_type,
        unit_price: amount,
        quantity: 1,
        created_at: new Date()
      });

      // 4. Create Measurements (if filled)
      if (measurement.od_sphere || measurement.os_sphere) {
        await db.measurements.add({
          user_id: customer.id,
          order_id: orderId,
          ...measurement,
          measurement_date: new Date(),
          created_at: new Date()
        });
      }

      toast.success('Walk-in order created successfully!');
      // Reset form
      setFormData({
        name: '', email: '', mobile: '', outfit_type: 'Shirt', item_description: '',
        amount: 0, fabric_type: '', glass_cost: 0, discount: 0, advance: 0, advance_online: 0, 
        status: 'pending', pay_status: 'pending', bill_number: ''
      });
      setMeasurement({});

    } catch (err) {
      toast.error('Failed to create order');
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
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Outfit Type</label>
              <CustomSelect 
                name="outfit_type" 
                value={formData.outfit_type} 
                onChange={handleChange} 
                options={[
                  {value: "Shirt", label: "Shirt"},
                  {value: "Trouser", label: "Trouser"},
                  {value: "Suit", label: "Suit"},
                  {value: "Kurta", label: "Kurta"},
                  {value: "Pajama", label: "Pajama"},
                  {value: "Sherwani", label: "Sherwani"},
                  {value: "Other", label: "Other"}
                ]}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Item Description</label>
              <input type="text" name="item_description" value={formData.item_description} onChange={handleChange} placeholder="e.g. Slim fit, White buttons" className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Fabric Details</label>
              <input type="text" name="fabric_type" placeholder="e.g. Cotton, Linen, Client's Fabric" value={formData.fabric_type} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
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

        {/* Section 4: Measurements */}
        <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)]">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">3. Measurements</h2>
          <MeasurementForm measurement={measurement} setMeasurement={setMeasurement} />
        </div>

        {/* Section 3: Billing */}
        <div className="glassmorphism p-6 rounded-xl border border-luxury-gold/30 bg-luxury-gold/5">
          <h2 className="text-sm font-medium tracking-widest uppercase text-luxury-gold mb-6 border-b border-luxury-gold/20 pb-2">4. Billing Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Amount (₹)</label>
              <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Discount (₹)</label>
              <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div className="bg-[var(--input-bg)] p-4 rounded-lg border border-luxury-gold/20 col-span-1 md:col-span-2 flex justify-between items-center mt-4">
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">Final Total</span>
                <span className="text-xl font-light text-[var(--text-primary)]">₹{totalCost.toFixed(2)}</span>
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
