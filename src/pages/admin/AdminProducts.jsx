import { useState, useEffect } from 'react';
import { HiOutlineSearch, HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiX, HiOutlinePhotograph, HiOutlineCamera } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import ConfirmModal from '../../components/shared/ConfirmModal';
import CustomPagination from '../../components/shared/CustomPagination';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmModalData, setConfirmModalData] = useState({ isOpen: false, idToDelete: null });
  
  const [formData, setFormData] = useState({
    name: '', brand: '', price: '', stock_quantity: '', frame_type: 'Full Rim', material: 'Plastic', shape: 'Square', gender: 'Unisex', default_reminder_months: 12,
    image_gallery: [{ color: 'Default', images: [''] }]
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const allProducts = await db.products.toArray();
      setProducts(allProducts);
    } catch (err) {
      toast.error('Failed to load products');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value.toLowerCase());
    setCurrentPage(1); // Reset to first page on search
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm) || 
    p.brand.toLowerCase().includes(searchTerm) ||
    p.sku.toLowerCase().includes(searchTerm)
  );

  const indexOfLastProduct = currentPage * limit;
  const indexOfFirstProduct = indexOfLastProduct - limit;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / limit);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      name: '', brand: '', price: '', stock_quantity: '', frame_type: 'Full Rim', material: 'Plastic', shape: 'Square', gender: 'Unisex', default_reminder_months: 12,
      image_gallery: [{ color: '', images: [''] }]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    let initialGallery = [{ color: '', images: [''] }];
    if (product.image_gallery && Array.isArray(product.image_gallery) && product.image_gallery.length > 0) {
      initialGallery = product.image_gallery;
    } else if (product.image_url) {
      initialGallery = [{ color: product.color || 'Default', images: [product.image_url] }];
    }

    setFormData({
      name: product.name,
      brand: product.brand,
      price: product.price,
      stock_quantity: product.stock_quantity,
      frame_type: product.frame_type,
      material: product.material,
      shape: product.shape,
      gender: product.gender,
      default_reminder_months: product.default_reminder_months,
      image_gallery: initialGallery
    });
    setIsModalOpen(true);
  };

  const handleColorChange = (index, val) => {
    const newGallery = [...formData.image_gallery];
    newGallery[index].color = val;
    setFormData({ ...formData, image_gallery: newGallery });
  };

  const handleImageChange = (colorIndex, imgIndex, val) => {
    const newGallery = [...formData.image_gallery];
    newGallery[colorIndex].images[imgIndex] = val;
    setFormData({ ...formData, image_gallery: newGallery });
  };

  const handleFileUpload = async (colorIndex, imgIndex, file) => {
    if (!file) return;
    try {
      toast.loading('Saving image...', { id: 'upload' });
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageChange(colorIndex, imgIndex, reader.result);
        toast.success('Image saved locally!', { id: 'upload' });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Upload failed', { id: 'upload' });
    }
  };

  const addImageToColor = (colorIndex) => {
    const newGallery = [...formData.image_gallery];
    if (newGallery[colorIndex].images.length < 3) {
      newGallery[colorIndex].images.push('');
      setFormData({ ...formData, image_gallery: newGallery });
    }
  };

  const addColorSection = () => {
    setFormData({ 
      ...formData, 
      image_gallery: [...formData.image_gallery, { color: '', images: [''] }] 
    });
  };

  const removeColorSection = (index) => {
    const newGallery = formData.image_gallery.filter((_, i) => i !== index);
    setFormData({ ...formData, image_gallery: newGallery });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const mainImageUrl = formData.image_gallery[0]?.images[0] || 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80';
      const mainColor = formData.image_gallery[0]?.color || 'Default';

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        default_reminder_months: parseInt(formData.default_reminder_months),
        image_url: mainImageUrl,
        color: mainColor
      };

      if (editingId) {
        // Update product
        await db.products.update(editingId, { ...payload, updated_at: new Date() });
        toast.success('Frame updated successfully');
      } else {
        // Create new product
        await db.products.add({
          ...payload,
          sku: `SKU-${Date.now().toString().slice(-6)}`,
          description: 'Newly added premium frame.',
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        });
        toast.success('Frame added successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to save frame');
    }
  };

  const confirmDelete = (id) => {
    setConfirmModalData({ isOpen: true, idToDelete: id });
  };

  const deleteProduct = async () => {
    try {
      await db.products.delete(confirmModalData.idToDelete);
      toast.success('Frame deleted successfully');
      fetchProducts();
    } catch(err) {
      toast.error('Failed to delete frame');
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[var(--border-color)] pb-6 gap-4">
        <div>
          <h1 className="text-2xl font-light tracking-widest uppercase">Inventory Management</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Manage products, stock, and default reminder intervals</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-luxury-gold text-black uppercase tracking-widest text-xs font-medium hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 px-6 py-3 rounded flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)]"
        >
          <HiOutlinePlus className="w-4 h-4" /> Add New Frame
        </button>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] overflow-hidden">
        <div className="p-4 border-b border-[var(--border-color)] flex items-center gap-3 bg-[var(--input-bg)]">
          <HiOutlineSearch className="w-5 h-5 text-[var(--text-faint)]" />
          <input 
            type="text" 
            placeholder="Search frames by name, brand, or SKU..." 
            onChange={handleSearch}
            className="bg-transparent border-none text-[var(--text-primary)] w-full focus:outline-none placeholder-[var(--input-placeholder)]"
          />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="text-xs text-[var(--text-faint)] uppercase bg-[var(--bg-card)]">
              <tr>
                <th className="px-6 py-4 font-medium tracking-wider">Image</th>
                <th className="px-6 py-4 font-medium tracking-wider">Name & SKU</th>
                <th className="px-6 py-4 font-medium tracking-wider">Brand</th>
                <th className="px-6 py-4 font-medium tracking-wider">Price</th>
                <th className="px-6 py-4 font-medium tracking-wider">Stock</th>
                <th className="px-6 py-4 font-medium tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {currentProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[var(--bg-card)] transition-colors">
                  <td className="px-6 py-4">
                    <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded object-cover border border-[var(--border-color)]" onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100x100?text=No+Img'; }} />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[var(--text-primary)]">{p.name}</p>
                    <p className="text-xs text-[var(--text-faint)] mt-1">{p.sku}</p>
                  </td>
                  <td className="px-6 py-4 uppercase text-xs tracking-wider">{p.brand}</td>
                  <td className="px-6 py-4 text-luxury-gold">₹{p.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${p.stock_quantity > 10 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                      {p.stock_quantity} in stock
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEditModal(p)} className="p-2 text-[var(--text-muted)] hover:text-luxury-gold transition-colors cursor-pointer">
                      <HiOutlinePencil className="w-5 h-5" />
                    </button>
                    <button onClick={() => confirmDelete(p.id)} className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors cursor-pointer ml-2">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {currentProducts.length === 0 && (
                <tr><td colSpan="6" className="text-center py-10 text-[var(--text-faint)]">No products found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <CustomPagination 
            page={currentPage} 
            totalPages={totalPages} 
            setPage={setCurrentPage} 
            limit={limit} 
            setLimit={setLimit} 
          />
        )}
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-[var(--border-color)]">
              <h2 className="text-lg uppercase tracking-widest text-luxury-gold">{editingId ? 'Edit Frame' : 'Add New Frame'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"><HiX className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-6">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Frame Name <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Brand <span className="text-red-500">*</span></label>
                <input required type="text" value={formData.brand} onChange={e=>setFormData({...formData, brand:e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Price (₹) <span className="text-red-500">*</span></label>
                <input required type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Stock Quantity <span className="text-red-500">*</span></label>
                <input required type="number" value={formData.stock_quantity} onChange={e=>setFormData({...formData, stock_quantity:e.target.value})} className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold" />
              </div>
              <div className="col-span-2">
                <hr className="border-[var(--border-color)] my-4" />
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-luxury-gold">Colors & Images</h3>
                  <button type="button" onClick={addColorSection} className="text-xs flex items-center gap-1 text-[var(--text-primary)] hover:text-luxury-gold transition-colors">
                    <HiOutlinePlus className="w-4 h-4" /> Add Color
                  </button>
                </div>
                
                <div className="space-y-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {formData.image_gallery.map((gallery, cIdx) => (
                    <div key={cIdx} className="bg-[var(--bg-card)] p-4 rounded-lg border border-[var(--border-color)] relative">
                      {formData.image_gallery.length > 1 && (
                        <button type="button" onClick={() => removeColorSection(cIdx)} className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-red-400">
                          <HiX className="w-4 h-4" />
                        </button>
                      )}
                      
                      <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Color Name <span className="text-red-500">*</span></label>
                      <input required type="text" value={gallery.color} onChange={e => handleColorChange(cIdx, e.target.value)} placeholder="e.g. Matte Black" className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] focus:outline-none focus:border-luxury-gold mb-4" />

                      <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2">Image URLs (Max 3)</label>
                      <div className="space-y-3">
                        {gallery.images.map((img, iIdx) => (
                          <div key={iIdx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                            {img && (
                              <img src={img} alt={`Preview ${iIdx + 1}`} className="w-10 h-10 rounded object-cover border border-[var(--border-color)] flex-shrink-0" onError={(e) => { e.target.style.display = 'none'; }} />
                            )}
                            <input type="text" value={img} onChange={e => handleImageChange(cIdx, iIdx, e.target.value)} placeholder={`Image URL ${iIdx + 1} (Front/Side/Angled)`} className="flex-1 w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-4 py-2 text-[var(--input-text)] text-sm focus:outline-none focus:border-luxury-gold" />
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                              <div className="relative overflow-hidden cursor-pointer bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-primary)] uppercase tracking-widest text-xs font-semibold px-3 py-2 rounded hover:bg-luxury-gold hover:text-[var(--bg-primary)] transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5">
                                <HiOutlinePhotograph className="w-4 h-4" /> Gallery
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  onChange={(e) => handleFileUpload(cIdx, iIdx, e.target.files[0])}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </div>
                              <div className="relative overflow-hidden cursor-pointer bg-luxury-gold text-[var(--bg-primary)] uppercase tracking-widest text-xs font-semibold px-3 py-2 rounded hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors flex-1 sm:flex-none flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                                <HiOutlineCamera className="w-4 h-4" /> Camera
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  capture="environment"
                                  onChange={(e) => handleFileUpload(cIdx, iIdx, e.target.files[0])}
                                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {gallery.images.length < 3 && (
                        <button type="button" onClick={() => addImageToColor(cIdx)} className="text-xs text-luxury-gold hover:text-[var(--text-primary)] mt-3 flex items-center gap-1">
                          <HiOutlinePlus className="w-3 h-3" /> Add another image view
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <button type="submit" className="w-full bg-luxury-gold text-black uppercase tracking-widest py-3 rounded font-bold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors cursor-pointer mt-4">{editingId ? 'Update Frame' : 'Save Frame'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData({ isOpen: false, idToDelete: null })}
        onConfirm={deleteProduct}
        title="Delete Frame"
        message="Are you sure you want to permanently delete this frame from your inventory? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};

export default AdminProducts;
