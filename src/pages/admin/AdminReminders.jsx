import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import { HiOutlineTruck } from 'react-icons/hi';
import { shopConfig } from '../../config/shop';
import { useLiveQuery } from 'dexie-react-hooks';
import { Link } from 'react-router-dom';

const AdminReminders = () => {
  const dbSettings = useLiveQuery(() => db.settings.where({ key: 'shopSettings' }).first());
  const customShopConfig = dbSettings?.value ? { ...shopConfig, ...dbSettings.value } : shopConfig;
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today

      // Fetch pending and processing orders
      const pendingOrders = await db.orders.where('status').equals('pending').toArray();
      const processingOrders = await db.orders.where('status').equals('processing').toArray();
      const activeOrders = [...pendingOrders, ...processingOrders];

      const dueDeliveries = [];
      for (const order of activeOrders) {
        if (!order.delivery_date) continue;
        
        const dDate = new Date(order.delivery_date);
        
        // If delivery date is today or in the past
        if (dDate <= today) {
          const user = await db.users.get(order.user_id);
          if (user && user.mobile) {
            dueDeliveries.push({
              order_id: order.id,
              name: user.name,
              mobile: user.mobile,
              bill_number: order.bill_number,
              delivery_date: order.delivery_date,
              status: order.status
            });
          }
        }
      }

      // Sort by delivery date ascending (oldest/most overdue first)
      dueDeliveries.sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date));

      setDeliveries(dueDeliveries);
    } catch (error) {
      toast.error('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const markCompleted = async (id) => {
    try {
      await db.orders.update(id, {
        status: 'completed',
        updated_at: new Date()
      });
      toast.success('Order marked as completed!');
      fetchDeliveries(); // refresh
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="mb-8 border-b border-[var(--border-color)] pb-6">
        <h1 className="text-2xl font-light tracking-widest uppercase">Deliveries Due</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Track pending and processing orders that are due for delivery today or are past due.</p>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
          <h2 className="text-sm font-medium tracking-widest uppercase">Due Deliveries ({deliveries.length})</h2>
        </div>
        {deliveries.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No pending deliveries due! Great job!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs text-[var(--text-faint)] uppercase bg-[var(--input-bg)]">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Bill No.</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Customer</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Delivery Date</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {deliveries.map((del) => {
                  const messageText = encodeURIComponent(`✨ નમસ્તે ${del.name} જી,\n\n${customShopConfig.shopName || customShopConfig.shortName} માં તમારો ઓર્ડર તૈયાર છે! કૃપા કરીને સમય કાઢીને તમારી ડિલિવરી મેળવી લેવા વિનંતી.\n\nઆપનો દિવસ શુભ રહે!`);
                  const waUrl = `https://wa.me/${del.mobile}?text=${messageText}`;
                  
                  const isPastDue = new Date(del.delivery_date) < new Date(new Date().setHours(0,0,0,0));

                  return (
                  <tr key={del.order_id} className="hover:bg-[var(--bg-card)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{del.bill_number || `#${del.order_id}`}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{del.name}</td>
                    <td className="px-6 py-4">{del.mobile}</td>
                    <td className={`px-6 py-4 font-medium ${isPastDue ? 'text-red-400' : 'text-yellow-400'}`}>
                      {new Date(del.delivery_date).toLocaleDateString()}
                      {isPastDue && <span className="ml-2 text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded uppercase tracking-wider">Past Due</span>}
                    </td>
                    <td className="px-6 py-4 flex justify-center items-center space-x-3">
                      <a 
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500/30 px-3 py-1.5 rounded transition-colors text-xs uppercase tracking-wider cursor-pointer"
                      >
                        <span>WhatsApp Web</span>
                      </a>
                      <button 
                        onClick={() => markCompleted(del.order_id)}
                        className="inline-flex items-center space-x-2 bg-luxury-gold/10 text-luxury-gold hover:bg-luxury-gold hover:text-[var(--bg-primary)] border border-luxury-gold/30 px-3 py-1.5 rounded transition-colors text-xs uppercase tracking-wider cursor-pointer"
                      >
                        <HiOutlineTruck className="w-4 h-4" />
                        <span>Deliver</span>
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReminders;
