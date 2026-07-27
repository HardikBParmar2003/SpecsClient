import { useState, useEffect } from 'react';
import { HiOutlineUsers, HiOutlineShoppingBag, HiOutlineCurrencyRupee, HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import { db } from '../../services/db';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import CustomDatePicker from '../../components/shared/CustomDatePicker';

const AdminRevenue = () => {
  const [stats, setStats] = useState({ customers: 0, orders: 0, revenue: 0, revenueOffline: 0, revenueOnline: 0, changes: { customers: '+0%', orders: '+0%', revenue: '+0%' } });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        setLoading(true);
        let allUsers = await db.users.toArray();
        let allOrders = await db.orders.toArray();

        // Apply Date Filters
        if (fromDate) {
          const start = new Date(fromDate);
          start.setHours(0, 0, 0, 0);
          allUsers = allUsers.filter(u => new Date(u.created_at) >= start);
          allOrders = allOrders.filter(o => new Date(o.created_at) >= start);
        }
        
        if (toDate) {
          const end = new Date(toDate);
          end.setHours(23, 59, 59, 999);
          allUsers = allUsers.filter(u => new Date(u.created_at) <= end);
          allOrders = allOrders.filter(o => new Date(o.created_at) <= end);
        }

        const customersCount = allUsers.filter(u => !u.role || u.role === 'customer').length;
        const revenue = allOrders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
        const revenueOffline = allOrders.reduce((sum, o) => sum + (parseFloat(o.advance) || 0), 0);
        const revenueOnline = allOrders.reduce((sum, o) => sum + (parseFloat(o.advance_online) || 0), 0);
        
        setStats({
          customers: customersCount,
          orders: allOrders.length,
          revenue: revenue,
          revenueOffline: revenueOffline,
          revenueOnline: revenueOnline,
          changes: { customers: '+0%', orders: '+0%', revenue: '+0%' }
        });
      } catch (err) {
        console.error('Failed to fetch revenue stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueStats();
  }, [fromDate, toDate]);

  const statCards = [
    { name: 'Total Customers', value: stats.customers, icon: HiOutlineUsers, change: stats.changes.customers },
    { name: 'Total Orders', value: stats.orders, icon: HiOutlineShoppingBag, change: stats.changes.orders },
    { name: 'Revenue', value: `₹${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: HiOutlineCurrencyRupee, change: stats.changes.revenue, offline: stats.revenueOffline || 0, online: stats.revenueOnline || 0 },
  ];

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">My Revenue</h1>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-auto">
            <CustomDatePicker label="From" value={fromDate} onChange={setFromDate} />
          </div>
          <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest hidden sm:block">to</span>
          <div className="w-full sm:w-auto">
            <CustomDatePicker label="To" value={toDate} onChange={setToDate} />
          </div>
          {(fromDate || toDate) && (
             <button 
               onClick={() => { setFromDate(''); setToDate(''); }}
               className="px-4 py-2 bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-secondary)] text-xs uppercase tracking-widest font-medium rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-colors cursor-pointer ml-2 mt-2 sm:mt-0 shadow-sm flex items-center h-full"
             >
               Clear Filters
             </button>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="py-20"><LoadingSpinner /></div>
      ) : (
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
      )}
    </div>
  );
};

export default AdminRevenue;
