import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlinePhone, HiOutlineMail, HiOutlineShoppingBag, HiOutlineCalendar, HiOutlineCurrencyRupee } from 'react-icons/hi';
import { db } from '../../services/db';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import CustomPagination from '../../components/shared/CustomPagination';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomDatePicker from '../../components/shared/CustomDatePicker';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });
  
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500); // debounce search
    return () => clearTimeout(timer);
  }, [page, limit, search, startDate, endDate]);

  const fetchCustomers = async () => {
    try {
      let allUsers = await db.users.toArray();
      let allCustomers = allUsers.filter(u => !u.role || u.role === 'customer');

      if (startDate) {
        const start = new Date(startDate).getTime();
        allCustomers = allCustomers.filter(c => new Date(c.created_at).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 86400000; // include full day
        allCustomers = allCustomers.filter(c => new Date(c.created_at).getTime() <= end);
      }

      if (search) {
        const lowerSearch = search.toLowerCase();
        allCustomers = allCustomers.filter(c => 
          (c.name && c.name.toLowerCase().includes(lowerSearch)) ||
          (c.mobile && c.mobile.includes(lowerSearch)) ||
          (c.email && c.email.toLowerCase().includes(lowerSearch))
        );
      }

      const customersWithStats = await Promise.all(allCustomers.map(async (c) => {
        const orders = await db.orders.filter(o => Number(o.user_id) === Number(c.id)).toArray();
        const total_spent = orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
        
        const sortedOrders = orders.sort((a,b) => new Date(a.created_at) - new Date(b.created_at));
        const firstOrderPhoto = sortedOrders.find(o => o.photo)?.photo || null;

        return {
          ...c,
          orders_count: orders.length,
          total_spent,
          photo: firstOrderPhoto
        };
      }));

      customersWithStats.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

      setTotalPages(Math.ceil(customersWithStats.length / limit) || 1);
      setCustomers(customersWithStats.slice((page - 1) * limit, page * limit));
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = async (e) => {
    e.preventDefault();
    try {
      await db.users.update(selectedCustomer.id, {
        name: selectedCustomer.name,
        mobile: selectedCustomer.mobile,
        email: selectedCustomer.email,
        updated_at: new Date()
      });
      toast.success('Customer updated successfully');
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to update customer');
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      const customerId = Number(confirmModalData.idToDelete);
      
      const userOrders = await db.orders.where({ user_id: customerId }).toArray();
      const orderIds = userOrders.map(o => o.id);

      await db.transaction('rw', db.users, db.orders, db.order_items, db.measurements, db.reminders_log, async () => {
        // Delete all associated items for these orders
        for (const oId of orderIds) {
          await db.order_items.where({ order_id: oId }).delete();
          await db.measurements.where({ order_id: oId }).delete();
          await db.reminders_log.where({ order_id: oId }).delete();
        }
        // Delete the orders
        for (const oId of orderIds) {
           await db.orders.delete(oId);
        }
        // Delete the user
        await db.users.delete(customerId);
      });

      toast.success('Customer deleted successfully');
      setConfirmModalData({ isOpen: false, idToDelete: null });
      fetchCustomers();
    } catch (err) {
      toast.error('Failed to delete customer');
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">Customer Directory</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">View online shoppers and walk-in clients</p>
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <div className="p-6 border-b border-[var(--border-color)] flex flex-col xl:flex-row justify-between xl:items-center gap-4 bg-[var(--bg-card)] rounded-t-xl">
          <div className="relative w-full xl:w-80">
            <input
              type="text"
              placeholder="Search name, mobile, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:outline-none transition-colors"
            />
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto mt-4 xl:mt-0">
            <div className="w-full sm:w-auto">
              <CustomDatePicker label="From" value={startDate} onChange={(val) => { setStartDate(val); setPage(1); }} />
            </div>
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest hidden sm:block">to</span>
            <div className="w-full sm:w-auto">
              <CustomDatePicker label="To" value={endDate} onChange={(val) => { setEndDate(val); setPage(1); }} />
            </div>
            {(startDate || endDate) && (
               <button 
                 onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                 className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs uppercase tracking-widest font-medium rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer ml-2 mt-2 sm:mt-0 shadow-sm flex items-center h-full"
               >
                 Clear Filters
               </button>
            )}
          </div>
        </div>
        {customers.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No customers found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[var(--bg-primary)]/50 rounded-b-xl border-t border-[var(--border-color)]/30">
            {customers.map((c) => (
              <div 
                key={c.id} 
                onClick={() => navigate(`/admin/customers/${c.id}/orders`, { state: { customer: c } })}
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-4 hover:border-luxury-gold/50 transition-all duration-300 cursor-pointer group shadow-[var(--shadow-card)] hover:shadow-lg relative flex flex-col gap-4"
              >
                {/* Header: Avatar, Name, Mobile */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 flex-shrink-0 flex items-center justify-center text-luxury-gold font-medium text-xl border border-luxury-gold/30 shadow-inner overflow-hidden">
                    {c.photo ? (
                      <img src={c.photo} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[var(--text-primary)] font-semibold truncate text-base group-hover:text-luxury-gold transition-colors">{c.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mt-1">
                      <HiOutlinePhone className="w-3.5 h-3.5 text-luxury-gold/70" />
                      <span className="truncate">{c.mobile}</span>
                    </div>
                  </div>
                </div>
                
                {/* Footer: Stats & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]/50">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Spent</span>
                      <span className="text-sm font-bold text-luxury-gold">₹{c.total_spent.toFixed(0)}</span>
                    </div>
                    <div className="w-px h-6 bg-[var(--border-color)]/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">Orders</span>
                      <span className="text-sm font-semibold text-[var(--text-primary)]">{c.orders_count}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedCustomer(c);
                        setIsEditModalOpen(true); 
                      }} 
                      className="p-2 text-[var(--text-secondary)] hover:text-luxury-gold hover:bg-luxury-gold/10 transition-all duration-300 rounded-lg"
                      title="Edit"
                    >
                      <HiOutlinePencil className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setConfirmModalData({ isOpen: true, idToDelete: c.id }); }} 
                      className="p-2 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 transition-all duration-300 rounded-lg"
                      title="Delete"
                    >
                      <HiOutlineTrash className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <CustomPagination 
          page={page} 
          totalPages={totalPages} 
          setPage={setPage} 
          limit={limit} 
          setLimit={setLimit} 
        />
      </div>

      {/* Edit Customer Modal */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Customer</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update customer details</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditCustomer} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Full Name *</label>
                  <input type="text" required value={selectedCustomer.name || ''} onChange={e => setSelectedCustomer({...selectedCustomer, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Mobile Number *</label>
                  <input type="text" required value={selectedCustomer.mobile || ''} onChange={e => setSelectedCustomer({...selectedCustomer, mobile: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Email Address</label>
                  <input type="email" value={selectedCustomer.email || ''} onChange={e => setSelectedCustomer({...selectedCustomer, email: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={handleDeleteCustomer}
        title="Delete Customer"
        message="Are you sure you want to permanently delete this customer? This action will also securely delete ALL their orders, measurements, and order history. This cannot be undone."
      />
    </div>
  );
};

export default AdminCustomers;
