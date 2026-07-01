import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineX, HiOutlineArrowLeft } from 'react-icons/hi';
import CustomDatePicker from '../../components/shared/CustomDatePicker';
import CustomPagination from '../../components/shared/CustomPagination';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminPartyPurchases = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [party, setParty] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [newPurchase, setNewPurchase] = useState({ item_name: '', quantity: 1, total_cost: '', paid_amount: '', date: new Date().toISOString().split('T')[0] });

  const fetchParty = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/parties/${id}`);
      if (data.success) {
        setParty(data.data);
      }
    } catch (err) {
      toast.error('Failed to load party details');
      navigate('/admin/parties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParty();
  }, [id]);

  const handleAddPurchase = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/parties/${id}/purchases`, newPurchase);
      if (data.success) {
        toast.success('Purchase recorded successfully');
        setIsAddModalOpen(false);
        setNewPurchase({ item_name: '', quantity: 1, total_cost: '', paid_amount: '', date: new Date().toISOString().split('T')[0] });
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to add purchase');
    }
  };

  const handleEditPurchase = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/parties/${id}/purchases/${selectedPurchase.id}`, selectedPurchase);
      if (data.success) {
        toast.success('Purchase updated successfully');
        setIsEditModalOpen(false);
        fetchParty();
      }
    } catch (err) {
      toast.error('Failed to update purchase');
    }
  };

  const allPurchases = party?.purchases || [];
  const totalPages = Math.ceil(allPurchases.length / itemsPerPage);
  const currentPurchases = allPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/parties')} className="text-[var(--text-muted)] hover:text-luxury-gold transition-colors cursor-pointer">
              <HiOutlineArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">
              {party ? `${party.name} Purchases` : 'Purchases'}
            </h1>
          </div>
          {party && (
             <div className="flex gap-6 mt-2 text-sm">
               <p className="text-[var(--text-secondary)]">Due Balance: <strong className="text-red-400">₹{Number(party.due_balance || 0).toFixed(2)}</strong></p>
               <p className="text-[var(--text-secondary)]">Total Paid: <strong className="text-green-400">₹{Number(party.total_paid || 0).toFixed(2)}</strong></p>
             </div>
          )}
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center gap-2 cursor-pointer"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Purchase
        </button>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Date</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Item Name</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Qty</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Total Cost</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-right">Paid Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8">Loading purchases...</td></tr>
              ) : currentPurchases.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-[var(--text-muted)]">No purchases found.</td></tr>
              ) : (
                currentPurchases.map(purchase => (
                  <tr 
                    key={purchase.id} 
                    onClick={() => { setSelectedPurchase(purchase); setIsViewModalOpen(true); }}
                    className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-sm">{new Date(purchase.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">{purchase.item_name}</td>
                    <td className="px-6 py-4 text-sm text-right">{purchase.quantity}</td>
                    <td className="px-6 py-4 text-sm text-right">₹{Number(purchase.total_cost).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-green-400 text-right">₹{Number(purchase.paid_amount).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && allPurchases.length > 0 && (
          <CustomPagination 
            page={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
          />
        )}
      </div>

      {/* View Purchase Modal */}
      {isViewModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Purchase Details</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">{new Date(selectedPurchase.date).toLocaleDateString('en-GB')}</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setIsViewModalOpen(false); setSelectedPurchase({...selectedPurchase, date: new Date(selectedPurchase.date).toISOString().split('T')[0]}); setIsEditModalOpen(true); }} 
                  className="text-luxury-gold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-luxury-gold/10 px-3 py-1.5 rounded-md"
                >
                  <HiOutlinePencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setIsViewModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold text-lg">
                      {selectedPurchase.item_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[var(--text-primary)] font-medium text-base">{selectedPurchase.item_name}</h3>
                      <p className="text-[var(--text-muted)] text-xs">Qty: {selectedPurchase.quantity}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Financial Summary</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-secondary)] text-sm">Total Cost</span>
                  <span className="text-[var(--text-primary)] text-sm">₹{Number(selectedPurchase.total_cost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-secondary)] text-sm">Paid Amount</span>
                  <span className="text-green-400 text-sm">₹{Number(selectedPurchase.paid_amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)] border-dashed">
                  <span className="text-luxury-gold font-bold uppercase tracking-widest text-sm">Due Balance</span>
                  <span className="text-2xl font-light text-luxury-gold">₹{Math.max(0, Number(selectedPurchase.total_cost) - Number(selectedPurchase.paid_amount)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Purchase Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add Purchase</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Record a new purchase</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddPurchase} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Date *</label>
                  <div className="w-full">
                    <CustomDatePicker 
                      value={newPurchase.date} 
                      onChange={val => setNewPurchase({...newPurchase, date: val})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Item Name *</label>
                  <input type="text" required value={newPurchase.item_name} onChange={e => setNewPurchase({...newPurchase, item_name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" placeholder="e.g. RayBan Frames" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Quantity *</label>
                  <input type="number" required min="1" value={newPurchase.quantity} onChange={e => setNewPurchase({...newPurchase, quantity: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Total Cost (₹) *</label>
                    <input type="number" step="0.01" required value={newPurchase.total_cost} onChange={e => setNewPurchase({...newPurchase, total_cost: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Paid Amount (₹) *</label>
                    <input type="number" step="0.01" required value={newPurchase.paid_amount} onChange={e => setNewPurchase({...newPurchase, paid_amount: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Record Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Purchase Modal */}
      {isEditModalOpen && selectedPurchase && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Purchase</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update purchase details</p>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditPurchase} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Date *</label>
                  <div className="w-full">
                    <CustomDatePicker 
                      value={selectedPurchase.date} 
                      onChange={val => setSelectedPurchase({...selectedPurchase, date: val})} 
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Item Name *</label>
                  <input type="text" required value={selectedPurchase.item_name} onChange={e => setSelectedPurchase({...selectedPurchase, item_name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Quantity *</label>
                  <input type="number" required min="1" value={selectedPurchase.quantity} onChange={e => setSelectedPurchase({...selectedPurchase, quantity: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Total Cost (₹) *</label>
                    <input type="number" step="0.01" required value={selectedPurchase.total_cost} onChange={e => setSelectedPurchase({...selectedPurchase, total_cost: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Paid Amount (₹) *</label>
                    <input type="number" step="0.01" required value={selectedPurchase.paid_amount} onChange={e => setSelectedPurchase({...selectedPurchase, paid_amount: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                  </div>
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPartyPurchases;
