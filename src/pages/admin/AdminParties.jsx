import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlineOfficeBuilding, HiOutlinePencil, HiOutlineX } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import CustomPagination from '../../components/shared/CustomPagination';

const AdminParties = () => {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddPartyModalOpen, setIsAddPartyModalOpen] = useState(false);
  const [isEditPartyModalOpen, setIsEditPartyModalOpen] = useState(false);
  const [isViewPartyModalOpen, setIsViewPartyModalOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [newParty, setNewParty] = useState({ name: '', phone: '', address: '' });
  const navigate = useNavigate();

  const fetchParties = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/parties');
      if (data.success) {
        setParties(data.data);
      }
    } catch (err) {
      toast.error('Failed to load parties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParties();
  }, []);

  const handleAddParty = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/parties', newParty);
      if (data.success) {
        toast.success('Party added successfully');
        setIsAddPartyModalOpen(false);
        setNewParty({ name: '', phone: '', address: '' });
        fetchParties();
      }
    } catch (err) {
      toast.error('Failed to add party');
    }
  };

  const handleEditParty = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put(`/parties/${selectedParty.id}`, selectedParty);
      if (data.success) {
        toast.success('Party updated successfully');
        setIsEditPartyModalOpen(false);
        fetchParties();
      }
    } catch (err) {
      toast.error('Failed to update party');
    }
  };

  const totalPages = Math.ceil(parties.length / itemsPerPage);
  const currentParties = parties.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-light tracking-widest uppercase text-gradient">Parties & Suppliers</h1>
          <p className="text-[var(--text-secondary)] mt-1">Manage suppliers, purchases, and payments</p>
        </div>
        <button 
          onClick={() => setIsAddPartyModalOpen(true)}
          className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-luxury-gold-dark transition-colors flex items-center gap-2 cursor-pointer"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Party
        </button>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-color)] bg-[var(--bg-card)]/50">
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Party Name</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)]">Contact Info</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Total Purchases</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Total Paid</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Due Balance</th>
                <th className="px-6 py-4 font-medium tracking-wider text-sm uppercase text-[var(--text-secondary)] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8">Loading parties...</td></tr>
              ) : currentParties.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-[var(--text-muted)]">No parties found.</td></tr>
              ) : (
                currentParties.map(party => (
                  <tr 
                    key={party.id} 
                    onClick={() => { setSelectedParty(party); setIsViewPartyModalOpen(true); }}
                    className="hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                      <div className="flex items-center gap-2">
                        <HiOutlineOfficeBuilding className="text-luxury-gold w-5 h-5" />
                        {party.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{party.phone || 'N/A'}</div>
                      <div className="text-xs text-[var(--text-muted)]">{party.address}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-center">₹{Number(party.total_cost || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-green-400 text-center">₹{Number(party.total_paid || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-400 text-center">₹{Number(party.due_balance || 0).toFixed(2)}</td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-center">
                        <button 
                          onClick={() => navigate(`/admin/parties/${party.id}/purchases`)}
                          className="text-luxury-gold hover:text-[var(--bg-primary)] hover:bg-luxury-gold transition-colors text-xs uppercase tracking-wider font-semibold flex items-center gap-1 cursor-pointer bg-luxury-gold/10 px-3 py-1.5 rounded-md border border-luxury-gold/30"
                        >
                          Purchases
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && parties.length > 0 && (
          <CustomPagination 
            page={currentPage}
            totalPages={totalPages}
            setPage={setCurrentPage}
            limit={itemsPerPage}
            setLimit={setItemsPerPage}
          />
        )}
      </div>

      {/* View Party Modal */}
      {isViewPartyModalOpen && selectedParty && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-3xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Party Details</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Information and balance summary</p>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { setIsViewPartyModalOpen(false); setIsEditPartyModalOpen(true); }} 
                  className="text-luxury-gold hover:text-white transition-colors cursor-pointer text-xs uppercase tracking-widest font-semibold flex items-center gap-1 bg-luxury-gold/10 px-3 py-1.5 rounded-md"
                >
                  <HiOutlinePencil className="w-4 h-4" /> Edit
                </button>
                <button onClick={() => setIsViewPartyModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                  <HiOutlineX className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5 mb-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold font-bold text-lg">
                      {selectedParty.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-[var(--text-primary)] font-medium text-base">{selectedParty.name}</h3>
                      <p className="text-[var(--text-muted)] text-xs">{selectedParty.phone || 'No phone provided'}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-6 pt-6 border-t border-[var(--border-color)]">
                  <div>
                    <span className="text-[var(--text-muted)] text-xs uppercase tracking-widest block mb-1">Address</span>
                    <span className="text-[var(--text-primary)] text-sm font-medium">{selectedParty.address || 'No address provided'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)] mb-4 border-b border-[var(--border-color)] pb-2">Financial Summary</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-secondary)] text-sm">Total Purchases</span>
                  <span className="text-[var(--text-primary)] text-sm">₹{Number(selectedParty.total_cost || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[var(--text-secondary)] text-sm">Total Paid</span>
                  <span className="text-green-400 text-sm">₹{Number(selectedParty.total_paid || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)] border-dashed">
                  <span className="text-luxury-gold font-bold uppercase tracking-widest text-sm">Due Balance</span>
                  <span className="text-2xl font-light text-luxury-gold">₹{Number(selectedParty.due_balance || 0).toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => navigate(`/admin/parties/${selectedParty.id}/purchases`)} 
                  className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-xs font-medium hover:bg-luxury-gold-dark transition-colors cursor-pointer"
                >
                  View All Purchases
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Party Modal */}
      {isAddPartyModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Add New Party</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Register a new supplier</p>
              </div>
              <button onClick={() => setIsAddPartyModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddParty} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Party Name *</label>
                  <input type="text" required value={newParty.name} onChange={e => setNewParty({...newParty, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Phone Number</label>
                  <input type="text" value={newParty.phone} onChange={e => setNewParty({...newParty, phone: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Address</label>
                  <textarea value={newParty.address} onChange={e => setNewParty({...newParty, address: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" rows="3"></textarea>
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Save Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Party Modal */}
      {isEditPartyModalOpen && selectedParty && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-2xl w-full max-w-xl overflow-hidden shadow-[var(--shadow-card)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
              <div>
                <h2 className="text-lg uppercase tracking-widest text-luxury-gold">Edit Party</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">Update supplier details</p>
              </div>
              <button onClick={() => setIsEditPartyModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer">
                <HiOutlineX className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleEditParty} className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-[var(--bg-primary)]">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Party Name *</label>
                  <input type="text" required value={selectedParty.name} onChange={e => setSelectedParty({...selectedParty, name: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Phone Number</label>
                  <input type="text" value={selectedParty.phone || ''} onChange={e => setSelectedParty({...selectedParty, phone: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest text-[var(--text-secondary)] mb-2">Address</label>
                  <textarea value={selectedParty.address || ''} onChange={e => setSelectedParty({...selectedParty, address: e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--text-primary)] focus:border-luxury-gold focus:outline-none transition-colors" rows="3"></textarea>
                </div>
              </div>
              <div className="pt-8 flex justify-end">
                <button type="submit" className="bg-luxury-gold text-black px-6 py-2 rounded uppercase tracking-widest text-sm font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer">
                  Update Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminParties;
