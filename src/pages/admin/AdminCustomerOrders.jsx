import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiX, HiOutlineEye, HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
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

  const fetchCustomerData = async () => {
    if (!customer?.mobile) return;
    try {
      const { data } = await api.get(`/admin/customers?search=${encodeURIComponent(customer.mobile)}`);
      if (data.success && data.data?.customers) {
        const updatedCustomer = data.data.customers.find(c => c.id === customer.id);
        if (updatedCustomer) {
          setCustomer(updatedCustomer);
        }
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
      await api.delete(`/orders/${confirmModalData.idToDelete}`);
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
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs text-[var(--text-faint)] uppercase bg-[var(--input-bg)]">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Order No.</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Order Status</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Payment</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Total</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {orders.map((order, index) => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-[var(--border-color)] transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border w-fit ${
                        order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        order.status === 'pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        order.status === 'processing' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        order.status === 'cancelled' ? 'bg-gray-500/10 text-gray-500 border-gray-500/20' : 
                        'bg-blue-500/10 text-blue-500 border-blue-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider border w-fit ${
                        order.pay_status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                        order.pay_status === 'pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                        order.pay_status === 'partially' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}>
                        {order.pay_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-luxury-gold">₹{parseFloat(order.total_price).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} 
                          className="p-2 text-[var(--text-secondary)] hover:text-luxury-gold transition-colors cursor-pointer rounded-full bg-[var(--input-bg)]"
                          title="View Details"
                        >
                          <HiOutlineEye className="w-4 h-4 mx-auto" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); setIsEditing(true); }} 
                          className="p-2 text-[var(--text-secondary)] hover:text-luxury-gold transition-colors cursor-pointer rounded-full bg-[var(--input-bg)] opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Edit Order"
                        >
                          <HiOutlinePencil className="w-4 h-4 mx-auto" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); confirmDelete(order.id); }} 
                          className="p-2 text-[var(--text-secondary)] hover:text-red-400 transition-colors cursor-pointer rounded-full bg-[var(--input-bg)] opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete Order"
                        >
                          <HiOutlineTrash className="w-4 h-4 mx-auto" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Selected Order Deep Details Modal */}
      {selectedOrder && !isEditing && (
        <OrderDetailsModal 
          order={{...selectedOrder, customerName: customer.name, mobile: customer.mobile}} 
          onClose={() => setSelectedOrder(null)} 
          onEdit={() => setIsEditing(true)} 
        />
      )}

      {isEditing && selectedOrder && (
        <EditOrderModal 
          order={selectedOrder} 
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
