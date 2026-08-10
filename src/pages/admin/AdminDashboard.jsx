import { useState, useEffect, useRef } from 'react';
import { HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyRupee, HiOutlineBell, HiOutlineEye, HiX, HiTrendingUp, HiTrendingDown, HiOutlinePencil, HiOutlineTrash, HiOutlineDownload, HiOutlineUpload } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import { exportDB, importInto } from 'dexie-export-import';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import EditOrderModal from '../../components/shared/EditOrderModal';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0, revenueOffline: 0, revenueOnline: 0, pendingReminders: 0, changes: { customers: '+0.00%', orders: '+0.00%', revenue: '+0.00%', pendingReminders: '+0.00%' } });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });
  const fileInputRef = useRef(null);

  const handleBackup = async () => {
    try {
      toast.loading('Generating backup...', { id: 'backup' });
      const blob = await exportDB(db);
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        try {
          const base64data = reader.result.split(',')[1];
          const fileName = `city_palace_backup_${new Date().toISOString().split('T')[0]}.json`;
          
          const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64data,
            directory: Directory.Cache
          });
          
          await Share.share({
            title: 'Database Backup',
            url: savedFile.uri,
            dialogTitle: 'Save or Share Backup'
          });
          
          toast.success('Backup ready to save or share!', { id: 'backup', duration: 4000 });
        } catch (shareErr) {
          console.error(shareErr);
          toast.error('Failed to share backup', { id: 'backup' });
        }
      };
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate backup', { id: 'backup' });
    }
  };

  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.confirm("WARNING: Restoring will overwrite all current data. Are you sure you want to proceed?")) {
      try {
        toast.loading('Restoring database...', { id: 'restore' });
        await importInto(db, file, { 
          clearTablesBeforeImport: true, 
          acceptVersionDiff: true, 
          acceptNameDiff: true, 
          acceptMissingTables: true 
        });
        toast.success('Database restored successfully!', { id: 'restore' });
        fetchDashboard();
      } catch (error) {
        console.error(error);
        toast.error('Failed to restore database', { id: 'restore' });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fetchDashboard = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const allUsers = await db.users.toArray();
      const todayUsers = allUsers.filter(u => {
        const d = new Date(u.created_at);
        return d >= startOfDay && d <= endOfDay && (!u.role || u.role === 'customer');
      });
      const customersCount = todayUsers.length;

      const allOrders = await db.orders.toArray();
      const todayOrders = allOrders.filter(o => {
        const d = new Date(o.created_at);
        return d >= startOfDay && d <= endOfDay;
      });
      const revenue = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
      const revenueOffline = todayOrders.reduce((sum, o) => sum + (parseFloat(o.advance) || 0), 0);
      const revenueOnline = todayOrders.reduce((sum, o) => sum + (parseFloat(o.advance_online) || 0), 0);
      
      const statsObj = {
        customers: customersCount,
        orders: todayOrders.length,
        revenue: revenue,
        revenueOffline: revenueOffline,
        revenueOnline: revenueOnline,
        pendingReminders: 0,
        changes: { customers: '+0%', orders: '+0%', revenue: '+0%' }
      };
      
      todayOrders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      const recent = todayOrders.slice(0, 10);
      
      const mappedRecent = await Promise.all(recent.map(async (o) => {
        const u = allUsers.find(u => u.id === o.user_id);
        const orderItems = await db.order_items.where({ order_id: o.id }).toArray();
        const measurements = await db.measurements.where({ order_id: o.id }).toArray();
        return {
          ...o,
          customerName: u ? u.name : 'Unknown',
          customerMobile: u ? u.mobile : '',
          amount: parseFloat(o.total_price) || 0,
          order_items: orderItems,
          measurements: measurements
        };
      }));

      setStats(statsObj);
      setRecentOrders(mappedRecent);
    } catch (err) {
      console.error('Failed to fetch dashboard', err);
    }
  };

  const confirmDelete = (id) => {
    setConfirmModalData({ isOpen: true, idToDelete: id });
  };

  const deleteOrder = async () => {
    try {
      const orderId = Number(confirmModalData.idToDelete);
      if (isNaN(orderId)) throw new Error('Invalid Order ID');
      
      await db.transaction('rw', db.orders, db.order_items, db.measurements, db.reminders_log, async () => {
        await db.orders.delete(orderId);
        await db.order_items.where({ order_id: orderId }).delete();
        await db.measurements.where({ order_id: orderId }).delete();
        await db.reminders_log.where({ order_id: orderId }).delete();
      });

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
    { name: "Today's Customers", value: stats.customers, icon: HiOutlineUsers, change: stats.changes?.customers || '+0.00%' },
    { name: "Today's Orders", value: stats.orders, icon: HiOutlineShoppingBag, change: stats.changes?.orders || '+0.00%' },
    { name: "Today's Revenue", value: `₹${stats.revenue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`, icon: HiOutlineCurrencyRupee, change: stats.changes?.revenue || '+0.00%', offline: stats.revenueOffline || 0, online: stats.revenueOnline || 0 },
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
            
            {stat.offline !== undefined && stat.online !== undefined && (
              <div className="flex justify-between items-center mt-3 mb-2">
                <div className="text-base text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider text-xs">Offline: </span> 
                  <span className="text-luxury-gold font-semibold text-lg">₹{stat.offline.toFixed(2)}</span>
                </div>
                <div className="text-base text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider text-xs">Online: </span> 
                  <span className="text-luxury-gold font-semibold text-lg">₹{stat.online.toFixed(2)}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
              <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Data for Today only</span>
            </div>
          </div>
        ))}
      </div>

      {/* Data Management Section */}
      <div className="glassmorphism rounded-xl border border-[var(--border-color)] p-6 mb-12 flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-card)]">
        <div>
          <h2 className="text-sm font-semibold tracking-widest uppercase text-luxury-gold">Data Management</h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">Backup your shop data securely or restore from a previous backup file.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={handleBackup}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-primary)] uppercase tracking-widest text-xs font-semibold px-4 py-3 rounded hover:bg-luxury-gold hover:text-[var(--bg-primary)] transition-colors"
          >
            <HiOutlineDownload className="w-4 h-4" /> Backup Data
          </button>
          
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            onChange={handleRestore} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-luxury-gold text-black uppercase tracking-widest text-xs font-semibold px-4 py-3 rounded hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors shadow-[0_0_10px_rgba(212,175,55,0.3)]"
          >
            <HiOutlineUpload className="w-4 h-4" /> Restore Data
          </button>
        </div>
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
                <th className="px-6 py-4 font-medium tracking-wider">Order Status</th>
                <th className="px-6 py-4 font-medium tracking-wider">Payment</th>
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
                    <span className={`px-2 py-1 rounded text-[10px] uppercase w-fit ${
                      order.status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                      order.status === 'pending' ? 'bg-red-500/10 text-red-400' : 
                      order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-400' : 
                      order.status === 'cancelled' ? 'bg-gray-500/10 text-gray-400' : 
                      'bg-blue-500/10 text-blue-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] uppercase w-fit ${
                      order.pay_status === 'completed' ? 'bg-green-500/10 text-green-400' : 
                      order.pay_status === 'pending' ? 'bg-red-500/10 text-red-400' : 
                      order.pay_status === 'partially' ? 'bg-yellow-500/10 text-yellow-400' : 
                      'bg-gray-500/10 text-gray-400'
                    }`}>
                      {order.pay_status}
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
                  <td colSpan="8" className="px-6 py-8 text-center text-[var(--text-muted)]">No recent orders found.</td>
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
