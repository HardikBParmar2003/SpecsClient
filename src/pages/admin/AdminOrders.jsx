import { useState, useEffect } from 'react';
import { HiOutlineEye, HiX, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
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
      const params = { page, limit, _t: Date.now() };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await api.get('/orders', { params });
      if (data.success) {
        setOrders(data.data.orders.map(o => ({
          id: o.id.toString(),
          customerName: o.customer_name,
          mobile: o.customer_mobile,
          type: o.ord_type,
          amount: o.total_price,
          advance: o.advance,
          status: o.status,
          pay_method: o.pay_method,
          pay_status: o.pay_status,
          created_at: o.created_at,
          discount: o.discount,
          frame_price: o.frame_price,
          glass_price: o.glass_price,
          bill_number: o.bill_number,
          order_items: o.order_items,
          eye_prescriptions: o.eye_prescriptions
        })));
        setTotalPages(data.data.pagination.totalPages);
      }
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
      await api.delete(`/orders/${confirmModalData.idToDelete}`);
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
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <CustomDatePicker label="From" value={startDate} onChange={setStartDate} />
            <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest hidden sm:block">to</span>
            <CustomDatePicker label="To" value={endDate} onChange={setEndDate} />
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto min-h-[400px]">
          {isLoading ? (
            <div className="flex justify-center items-center h-64 text-[var(--text-muted)] text-sm tracking-widest uppercase">
              Loading orders...
            </div>
          ) : (
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
                {orders.map((order, index) => (
                  <tr key={order.id} onClick={() => setSelectedOrder(order)} className="hover:bg-[var(--border-color)] transition-colors cursor-pointer group">
                    <td className="px-6 py-4">#{(page - 1) * limit + index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="px-6 py-4 min-w-[120px]">{order.customerName}</td>
                    <td className="px-6 py-4 text-luxury-gold font-medium">₹{order.amount}</td>
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
                {orders.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-[var(--text-muted)]">No orders found for the selected criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
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
