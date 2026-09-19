import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiX, HiOutlineEye, HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import EditOrderModal from '../../components/shared/EditOrderModal';
import OrderDetailsModal from '../../components/shared/OrderDetailsModal';
import ConfirmModal from '../../components/shared/ConfirmModal';

const AdminCustomerOrders = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialCustomer = state?.customer;
  const [customer, setCustomer] = useState(initialCustomer);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    if (!customer?.mobile) return;
    try {
      const c = await db.users.where({ mobile: customer.mobile }).first();
      if (c) {
        let userOrders = await db.orders.filter(o => Number(o.user_id) === Number(c.id)).toArray();
        userOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        userOrders = await Promise.all(userOrders.map(async (o) => {
          const orderItems = await db.order_items.where({ order_id: o.id }).toArray();
          const measurements = await db.measurements.where({ order_id: o.id }).toArray();
          return {
            ...o,
            order_items: orderItems,
            measurements: measurements
          };
        }));

        c.orders = userOrders;
        c.orders_count = userOrders.length;
        setCustomer(c);
      }
    } catch (err) {
      console.error('Failed to fetch updated customer data', err);
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
      fetchCustomerData();
    } catch (err) {
      toast.error('Failed to delete order');
    } finally {
      setConfirmModalData({ isOpen: false, idToDelete: null });
    }
  };

  if (!customer) {
    return (
      <div className="py-20 text-center">
        <p className="text-[var(--text-muted)] mb-4">Customer details not found.</p>
        <button 
          onClick={() => navigate('/admin/customers')}
          className="text-luxury-gold hover:text-[var(--text-primary)] transition-colors uppercase tracking-widest text-sm border border-luxury-gold/30 px-6 py-2 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  const orders = customer.orders || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8 border-b border-[var(--border-color)] pb-6">
        <div>
          <button 
            onClick={() => navigate('/admin/customers')}
            className="flex items-center text-sm text-[var(--text-secondary)] hover:text-luxury-gold transition-colors mb-2 uppercase tracking-widest"
          >
            <HiOutlineArrowLeft className="mr-2" /> Back to Customers
          </button>
          <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">{customer.name}'s Orders</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">{customer.mobile} • {customer.orders_count} total orders</p>
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No orders found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-[var(--bg-primary)]/50 rounded-b-xl border-t border-[var(--border-color)]/30">
            {orders.map((order, index) => (
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
                      <img src={order.photo} alt={order.customer_name || customer.name} className="w-full h-full object-cover" />
                    ) : (
                      (order.customer_name || customer.name).charAt(0).toUpperCase()
                    )}
                  </div>
                </div>

                {/* Main Content & Right Column Wrapper */}
                <div className="flex-1 min-w-0 flex justify-between gap-2">
                  
                  {/* Left Side: Info & Badges */}
                  <div className="flex flex-col justify-center gap-1.5 min-w-0">
                    <h3 className="text-[var(--text-primary)] font-semibold truncate text-[15px] sm:text-base leading-none group-hover:text-luxury-gold transition-colors">
                      {order.customer_name || customer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] truncate">
                      {(order.shirt_qty > 0 || order.pant_qty > 0) ? (
                         <span className="flex items-center gap-1.5">
                           {order.shirt_qty > 0 && <span>👔 {order.shirt_qty}</span>}
                           {order.pant_qty > 0 && <span>👖 {order.pant_qty}</span>}
                         </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[var(--text-muted)]">
                          Order #{index + 1}
                        </span>
                      )}
                    </div>
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
                      <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">₹{parseFloat(order.total_price || order.amount || 0).toFixed(0)}</span>
                      {Math.max(0, parseFloat(order.total_price || order.amount || 0) - parseFloat(order.advance || 0) - parseFloat(order.advance_online || 0)) > 0 && (
                        <span className="text-[10px] sm:text-[11px] text-red-400 font-medium leading-tight mt-0.5">
                          Due: ₹{Math.max(0, parseFloat(order.total_price || order.amount || 0) - parseFloat(order.advance || 0) - parseFloat(order.advance_online || 0)).toFixed(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsEditing(true); }} 
                        className="text-[var(--text-muted)] hover:text-luxury-gold transition-colors p-1 rounded-md hover:bg-luxury-gold/10"
                        title="Edit"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                      </button>
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Order Deep Details Modal */}
      {selectedOrder && !isEditing && (
        <OrderDetailsModal 
          order={{...selectedOrder, customerName: selectedOrder.customer_name || customer.name, mobile: customer.mobile}} 
          onClose={() => setSelectedOrder(null)} 
          onEdit={() => setIsEditing(true)} 
        />
      )}

      {isEditing && selectedOrder && (
        <EditOrderModal 
          order={{...selectedOrder, customerName: selectedOrder.customer_name || customer.name}} 
          onClose={() => setIsEditing(false)} 
          onUpdate={() => {
            fetchCustomerData();
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

export default AdminCustomerOrders;
