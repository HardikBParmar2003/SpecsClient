import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyRupee, HiOutlineBell, HiOutlineEye, HiX, HiTrendingUp, HiTrendingDown, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import EditOrderModal from '../../components/shared/EditOrderModal';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0, pendingReminders: 0, changes: { customers: '+0.00%', orders: '+0.00%', revenue: '+0.00%', pendingReminders: '+0.00%' } });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data.success) {
        setStats(data.data.stats);
        setRecentOrders(data.data.recentOrders);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    }
  };

  const confirmDelete = (id) => {
    setConfirmModalData({ isOpen: true, idToDelete: id });
  };

  const deleteOrder = async () => {
    try {
      await api.delete(`/orders/${confirmModalData.idToDelete}`);
      toast.success('Order deleted successfully');
      fetchDashboard();
    } catch (err) {
      toast.error('Failed to delete order');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const statCards = [
    { name: 'Total Customers', value: stats.customers, icon: HiOutlineUsers, change: stats.changes?.customers || '+0.00%' },
    { name: 'Total Orders', value: stats.orders, icon: HiOutlineShoppingBag, change: stats.changes?.orders || '+0.00%' },
    { name: 'Revenue', value: `₹${stats.revenue?.toLocaleString() || 0}`, icon: HiOutlineCurrencyRupee, change: stats.changes?.revenue || '+0.00%' },
    // { name: 'Pending Reminders', value: stats.pendingReminders, icon: HiOutlineBell, change: stats.changes?.pendingReminders || '+0.00%' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-light tracking-widest uppercase mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {statCards.map((stat, idx) => (
          <div key={idx} className="glassmorphism p-6 rounded-xl border border-[var(--border-color)] relative overflow-hidden group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[var(--text-muted)] text-xs tracking-widest uppercase mb-1">{stat.name}</p>
                <h3 className="text-3xl font-light text-[var(--text-primary)]">{stat.value}</h3>
              </div>
              <div className="p-3 bg-[var(--bg-card)] rounded-lg group-hover:bg-luxury-gold/20 transition-colors">
                <stat.icon className="w-6 h-6 text-luxury-gold" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold tracking-wider ${
                stat.change.startsWith('+') 
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                  : stat.change.startsWith('-')
                    ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                    : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]'
              }`}>
                {stat.change.startsWith('+') ? <HiTrendingUp className="w-3 h-3" /> : stat.change.startsWith('-') ? <HiTrendingDown className="w-3 h-3" /> : null}
                {stat.change.replace(/[+-]/, '')}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">vs last month</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden relative">
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-card)]">
          <div>
            <h2 className="text-sm font-semibold tracking-widest uppercase text-luxury-gold">Recent Orders</h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">Latest transactions from your customers</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="text-xs text-[var(--text-faint)] uppercase bg-[var(--bg-card)]">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Order No.</th>
                <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
                <th className="px-6 py-4 font-medium tracking-wider">Amount</th>
                <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                <th className="px-6 py-4 font-medium tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {recentOrders.map((order, index) => (
                <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-[var(--border-color)] transition-colors cursor-pointer group">
                  <td className="px-6 py-4">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                  <td className="px-6 py-4 min-w-[120px]">{order.customerName}</td>
                  <td className="px-6 py-4">₹{order.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs uppercase ${
                      order.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                      order.status === 'pending' ? 'bg-red-500/10 text-red-400' : 
                      order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400' : 
                      order.status === 'cancelled' ? 'bg-gray-500/10 text-gray-400' : 
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} 
                        className="p-2 text-[var(--text-muted)] hover:text-luxury-gold transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <HiOutlineEye className="w-5 h-5 mx-auto" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsEditing(true); }} 
                        className="p-2 text-[var(--text-muted)] hover:text-luxury-gold transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Edit Order"
                      >
                        <HiOutlinePencil className="w-5 h-5 mx-auto" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); confirmDelete(order.id); }} 
                        className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors md:opacity-0 md:group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        title="Delete Order"
                      >
                        <HiOutlineTrash className="w-5 h-5 mx-auto" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-[var(--text-muted)]">No recent orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Order Deep Details Modal */}
      {!isEditing && selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
          onEdit={() => setIsEditing(true)} 
        />
      )}

      {isEditing && selectedOrder && (
        <EditOrderModal 
          order={selectedOrder} 
          onClose={() => setIsEditing(false)} 
          onUpdate={() => {
            fetchDashboard();
            setSelectedOrder(null);
            setIsEditing(false);
          }} 
        />
      )}

      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={deleteOrder}
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
      />
    </div>
  );
};

export default AdminDashboard;
