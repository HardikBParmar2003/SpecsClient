import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import MeasurementForm from '../../components/shared/MeasurementForm';
import CustomSelect from '../../components/shared/CustomSelect';
import CustomDatePicker from '../../components/shared/CustomDatePicker';

const AdminPOS = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    total_amount: 0,
    shirt_qty: 1,
    pant_qty: 1,
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: '',
    status: 'pending',
    pay_status: 'pending',
    advance: 0,
    bill_number: '',
    photo: ''
  });
  
  const [measurement, setMeasurement] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const totalCost = parseFloat(formData.total_amount) || 0;
  const advance = parseFloat(formData.advance) || 0;
  const totalAdvance = advance;
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
      const orderDateObj = formData.order_date ? new Date(formData.order_date) : new Date();
      const reminderDateObj = formData.reminder_date ? new Date(formData.reminder_date) : null;
      const deliveryDateObj = formData.delivery_date ? new Date(formData.delivery_date) : null;

      const orderId = await db.orders.add({
        user_id: customer.id,
        customer_name: formData.name,
        ord_type: 'walk-in',
        status: formData.status,
        fabric_price: 0,
        stitching_price: 0,
        discount: 0,
        total_price: totalCost,
        advance: advance,
        advance_online: 0,
        pay_status: formData.pay_status,
        pay_method: 'cash',
        bill_number: formData.bill_number,
        order_date: orderDateObj,
        delivery_date: deliveryDateObj,
        shirt_qty: Number(formData.shirt_qty),
        pant_qty: Number(formData.pant_qty),
        photo: formData.photo,
        created_at: new Date(),
        updated_at: new Date()
      });

      // 3. Create Order Item (Generic since product details removed)
      await db.order_items.add({
        order_id: orderId,
        custom_item_name: "Custom Tailoring Order",
        stitching_type: "Custom",
        unit_price: totalCost,
        quantity: 1,
        created_at: new Date()
      });

      // 4. Create Measurements (if filled)
      if (Object.keys(measurement).some(k => measurement[k] && String(measurement[k]).trim() !== '')) {
        await db.measurements.add({
          user_id: customer.id,
          order_id: orderId,
          ...measurement,
          measurement_date: new Date(),
          created_at: new Date()
        });
      }

      toast.success('Order created successfully!');
      // Reset form
      setFormData({
        name: '', email: '', mobile: '',
        total_amount: 0, advance: 0, shirt_qty: 1, pant_qty: 1, order_date: new Date().toISOString().split('T')[0], delivery_date: '', photo: '',
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
        <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">New Order</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Register customer and generate order</p>
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

        {/* Section 2: Order Settings */}
        <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] relative z-20">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">2. Order Details & Settings</h2>
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
              <input type="number" min="0" name="shirt_qty" value={formData.shirt_qty} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Pant Quantity</label>
              <input type="number" min="0" name="pant_qty" value={formData.pant_qty} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
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
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2">3. Body Measurements</h2>
          <MeasurementForm measurement={measurement} setMeasurement={setMeasurement} />
        </div>

        {/* Section 3: Billing */}
        <div className="glassmorphism p-6 rounded-xl border border-luxury-gold/30 bg-luxury-gold/5">
          <h2 className="text-sm font-medium tracking-widest uppercase text-luxury-gold mb-6 border-b border-luxury-gold/20 pb-2">4. Billing Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Total Amount (₹)</label>
              <input type="number" name="total_amount" value={formData.total_amount} onChange={handleChange} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Paid Amount (₹)</label>
              <input type="number" name="advance" value={formData.advance} onChange={handleChange} className={`w-full bg-[var(--input-bg)] border rounded px-4 py-2 text-[var(--input-text)] focus:outline-none transition-colors ${totalAdvance > totalCost ? 'border-red-500 focus:border-red-500' : 'border-[var(--input-border)] focus:border-luxury-gold'}`} />
            </div>
            {totalAdvance > totalCost && <p className="text-red-500 text-xs mt-1 col-span-1 md:col-span-2">Paid amount exceeds total amount!</p>}
            <div className="bg-[var(--input-bg)] p-4 rounded-lg border border-luxury-gold/20 col-span-1 md:col-span-2 flex justify-between items-center mt-4">
              <div className="flex flex-col">
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

        {/* Section 5: Order Photo */}
        <div className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] text-center">
          <h2 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-6 border-b border-[var(--border-color)] pb-2 text-left">5. Fabric / Reference Photo</h2>
          
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
