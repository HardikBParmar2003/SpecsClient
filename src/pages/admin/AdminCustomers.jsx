import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiOutlineSearch } from 'react-icons/hi';
import api from '../../services/api';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import CustomPagination from '../../components/shared/CustomPagination';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 500); // debounce search
    return () => clearTimeout(timer);
  }, [page, limit, search]);

  const fetchCustomers = async () => {
    try {
      const { data } = await api.get(`/admin/customers?page=${page}&limit=${limit}&search=${search}`);
      if (data.success) {
        setCustomers(data.data.customers || []);
        setTotalPages(data.data.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="py-20"><LoadingSpinner /></div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-[var(--border-color)] pb-6">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">Customer Directory</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">View online shoppers and walk-in clients</p>
        </div>
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search name, mobile, email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg pl-10 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-luxury-gold focus:outline-none transition-colors"
          />
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
        </div>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        {customers.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No customers found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="text-xs text-[var(--text-faint)] uppercase bg-[var(--input-bg)]">
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Name</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Contact</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Type</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Total Spent</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-right">Orders Count</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-center">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{c.name}</td>
                    <td className="px-6 py-4">
                      {c.mobile}<br/>
                      <span className="text-xs text-[var(--text-muted)]">{c.email || 'No email'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${c.cust_type === 'walk-in' ? 'bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                        {c.cust_type || 'online'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-luxury-gold font-medium">₹{c.total_spent.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">{c.orders_count}</td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => navigate(`/admin/customers/${c.id}/orders`, { state: { customer: c } })}
                        className="text-[var(--text-secondary)] hover:text-[var(--bg-primary)] hover:bg-luxury-gold px-4 py-1.5 border border-[var(--border-color)] hover:border-luxury-gold rounded transition-colors text-xs font-medium uppercase tracking-wider cursor-pointer"
                      >
                        View Orders
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};

export default AdminCustomers;
