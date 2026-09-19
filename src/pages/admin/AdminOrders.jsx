import { useState, useEffect } from 'react';
import { HiOutlineEye, HiX, HiOutlinePencil, HiOutlineTrash, HiOutlineDocumentText, HiOutlineShoppingBag, HiOutlineCreditCard, HiOutlineUser } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import CustomPagination from '../../components/shared/CustomPagination';
import EditOrderModal from '../../components/shared/EditOrderModal';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      let allOrders = await db.orders.toArray();
      allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      if (startDate) {
        const start = new Date(startDate).getTime();
        allOrders = allOrders.filter(o => new Date(o.created_at).getTime() >= start);
      }
      if (endDate) {
        const end = new Date(endDate).getTime() + 86400000; // include full day
        allOrders = allOrders.filter(o => new Date(o.created_at).getTime() <= end);
      }

      setTotalPages(Math.ceil(allOrders.length / limit) || 1);
      const paginatedOrders = allOrders.slice((page - 1) * limit, page * limit);

      const mappedOrders = await Promise.all(paginatedOrders.map(async (o) => {
        const user = await db.users.get(o.user_id);
        const orderItems = await db.order_items.where({ order_id: o.id }).toArray();
        const measurements = await db.measurements.where({ order_id: o.id }).toArray();
        
        return {
          id: o.id.toString(),
          customerName: o.customer_name || (user ? user.name : 'Unknown'),
          customer_name: o.customer_name,
          mobile: user ? user.mobile : '',
          type: o.ord_type,
          amount: o.total_price,
          advance: o.advance,
          advance_online: o.advance_online,
          status: o.status,
          pay_method: o.pay_method,
          pay_status: o.pay_status,
          created_at: o.created_at,
          discount: o.discount,
          fabric_price: o.fabric_price,
          stitching_price: o.stitching_price,
          bill_number: o.bill_number,
          shirt_qty: o.shirt_qty,
          pant_qty: o.pant_qty,
          photo: o.photo,
          order_date: o.order_date,
          delivery_date: o.delivery_date,
          order_items: orderItems,
          measurements: measurements
        };
      }));
      setOrders(mappedOrders);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset page on date filter change
    fetchOrders();
  }, [startDate, endDate]);

  useEffect(() => {
    fetchOrders();
  }, [page, limit, startDate, endDate]);

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
      fetchOrders();
    } catch (err) {
      toast.error('Failed to delete order');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-[var(--text-primary)]">All Orders</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage and track your entire order history.</p>
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)]">
        {/* Filters Header */}
        <div className="p-6 border-b border-[var(--border-color)] flex flex-col md:flex-row justify-between md:items-center gap-4 bg-[var(--bg-card)] rounded-t-xl">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold tracking-widest uppercase text-[var(--text-secondary)]">Order Directory</h2>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
            <div className="w-full sm:w-auto">
              <CustomDatePicker label="From" value={startDate} onChange={setStartDate} />
            </div>
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest hidden sm:block">to</span>
            <div className="w-full sm:w-auto">
              <CustomDatePicker label="To" value={endDate} onChange={setEndDate} />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-[var(--text-muted)] text-sm tracking-widest uppercase">
              Loading orders...
            </div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[var(--bg-primary)]/50 rounded-b-xl border-t border-[var(--border-color)]/30">
            {orders.map((order) => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)} 
                className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-3 sm:p-4 hover:border-luxury-gold/50 transition-all duration-300 cursor-pointer group shadow-[var(--shadow-card)] hover:shadow-md flex items-center gap-3 sm:gap-4 relative"
              >
                {/* Left Column: Chip & Avatar */}
                <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                  <span className="font-mono text-luxury-gold font-bold bg-luxury-gold/10 px-2 py-0.5 rounded border border-luxury-gold/20 text-[10px] shadow-sm">
                    #{order.bill_number || order.id}
                  </span>
                  {/* Avatar */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-luxury-gold/20 to-luxury-gold/5 flex items-center justify-center text-luxury-gold font-medium text-lg border border-luxury-gold/30 shadow-inner overflow-hidden">
                    {order.photo ? (
                      <img src={order.photo} alt={order.customerName} className="w-full h-full object-cover" />
                    ) : (
                      order.customerName.charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Main Content & Right Column Wrapper */}
                <div className="flex-1 min-w-0 flex justify-between gap-2">
                  
                  {/* Left Side: Info & Badges */}
                  <div className="flex flex-col justify-center gap-1.5 min-w-0">

                    <h3 className="text-[var(--text-primary)] font-semibold truncate text-[15px] sm:text-base leading-none group-hover:text-luxury-gold transition-colors">
                      {order.customerName}
                    </h3>
                    {(order.shirt_qty > 0 || order.pant_qty > 0) && (
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] truncate">
                         <span className="flex items-center gap-1.5">
                           {order.shirt_qty > 0 && <span>👔 {order.shirt_qty}</span>}
                           {order.pant_qty > 0 && <span>👖 {order.pant_qty}</span>}
                         </span>
                      </div>
                    )}
                    <div className="flex gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] uppercase font-bold tracking-wider ${
                        order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                        order.status === 'pending' ? 'bg-red-500/10 text-red-500' : 
                        order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        Ord: {order.status}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] uppercase font-bold tracking-wider ${
                        order.pay_status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                        order.pay_status === 'pending' ? 'bg-red-500/10 text-red-500' : 
                        order.pay_status === 'partially' ? 'bg-yellow-500/10 text-yellow-500' : 
                        'bg-gray-500/10 text-gray-500'
                      }`}>
                        Pay: {order.pay_status}
                      </span>
                    </div>
                  </div>

                  {/* Right Side: Date, Amounts, Actions */}
                  <div className="flex flex-col items-end justify-between flex-shrink-0">
                    <div className="text-[10px] sm:text-[11px] text-luxury-gold/80 font-medium whitespace-nowrap">
                      {order.delivery_date 
                        ? new Date(order.delivery_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : new Date(order.order_date || order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex flex-col items-end justify-center flex-1 my-1">
                      <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">₹{order.amount}</span>
                      {Math.max(0, order.amount - ((order.advance || 0) + (order.advance_online || 0))) > 0 && (
                        <span className="text-[10px] sm:text-[11px] text-red-400 font-medium leading-tight mt-0.5">
                          Due: ₹{Math.max(0, order.amount - ((order.advance || 0) + (order.advance_online || 0))).toFixed(0)}
                        </span>
                      )}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); confirmDelete(order.id); }} 
                      className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-500/10"
                      title="Delete Order"
                    >
                      <HiOutlineTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="p-12 text-center text-[var(--text-muted)] sm:col-span-2 lg:col-span-3">No orders found for the selected criteria.</div>
            )}
          </div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && orders.length > 0 && (
          <CustomPagination 
            page={page} 
            totalPages={totalPages} 
            setPage={setPage} 
            limit={limit} 
            setLimit={setLimit} 
          />
        )}
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
          onClose={() => {
            setIsEditing(false);
            setSelectedOrder(null);
          }}
          onUpdate={fetchOrders}
        />
      )}

      <ConfirmModal 
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={deleteOrder}
        title="Delete Order"
        message="Are you sure you want to permanently delete this order? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminOrders;
