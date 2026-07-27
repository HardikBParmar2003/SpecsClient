import { useState, useEffect } from 'react';
import { db } from '../services/db';
import ProductCard from '../components/shared/ProductCard';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import CustomSelect from '../components/shared/CustomSelect';
import { HiFilter } from 'react-icons/hi';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Filters state
  const [filters, setFilters] = useState({
    brand: '',
    frame_type: '',
    gender: ''
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const allProducts = await db.products.toArray();
      setProducts(allProducts || []);
    } catch (err) {
      console.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBrand = filters.brand === '' || product.brand === filters.brand;
    const matchType = filters.frame_type === '' || product.frame_type === filters.frame_type;
    const matchGender = filters.gender === '' || product.gender === filters.gender;
    return matchSearch && matchBrand && matchType && matchGender;
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortBy === 'price-desc') return parseFloat(b.price) - parseFloat(a.price);
    // newest (default): assume id is sequential or date based
    return b.id - a.id; 
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-light uppercase tracking-widest text-luxury-gold">Premium Eyewear</h1>
          <p className="text-[var(--text-muted)] mt-2 tracking-wider">Discover our exclusive collection ({filteredProducts.length} items)</p>
        </div>
        <div className="w-full md:w-auto flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-64">
            <input 
              type="text" 
              placeholder="Search eyewear..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-full pl-10 pr-4 py-2 text-[var(--input-text)] placeholder:text-[var(--input-placeholder)] focus:border-luxury-gold focus:outline-none transition-colors"
            />
            <svg className="w-4 h-4 text-[var(--text-muted)] absolute left-4 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs uppercase tracking-widest text-[var(--text-muted)] whitespace-nowrap">Sort By</span>
            <CustomSelect 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)} 
              options={[
                {value: "newest", label: "Newest"},
                {value: "price-asc", label: "Price: Low to High"},
                {value: "price-desc", label: "Price: High to Low"}
              ]}
              className="w-48"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
          <div className="glassmorphism p-6 rounded-xl border border-white/5 space-y-8 sticky top-28">
            
            <div>
              <h3 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-4">Gender</h3>
              <div className="space-y-3">
                {['Men', 'Women', 'Unisex'].map(g => (
                  <label key={g} className="flex items-center">
                    <input type="radio" name="gender" value={g} checked={filters.gender === g} onChange={handleFilterChange} className="bg-transparent border-white/30 text-luxury-gold focus:ring-luxury-gold" />
                    <span className="ml-3 text-sm text-[var(--text-primary)]">{g}</span>
                  </label>
                ))}
                <label className="flex items-center">
                    <input type="radio" name="gender" value="" checked={filters.gender === ''} onChange={handleFilterChange} className="bg-transparent border-white/30 text-luxury-gold focus:ring-luxury-gold" />
                    <span className="ml-3 text-sm text-[var(--text-primary)]">All</span>
                </label>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-4">Frame Type</h3>
              <CustomSelect 
                name="frame_type" 
                value={filters.frame_type} 
                onChange={handleFilterChange} 
                options={[
                  {value: "", label: "All Types"},
                  {value: "Full Rim", label: "Full Rim"},
                  {value: "Half Rim", label: "Half Rim"},
                  {value: "Rimless", label: "Rimless"}
                ]}
              />
            </div>

            <div>
              <h3 className="text-sm font-medium tracking-widest uppercase text-[var(--text-secondary)] mb-4">Brand</h3>
              <CustomSelect 
                name="brand" 
                value={filters.brand} 
                onChange={handleFilterChange} 
                options={[
                  {value: "", label: "All Brands"},
                  {value: "Ray-Ban", label: "Ray-Ban"},
                  {value: "Oakley", label: "Oakley"},
                  {value: "Prada", label: "Prada"},
                  {value: "Silhouette", label: "Silhouette"}
                ]}
              />
            </div>
            
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="py-20"><LoadingSpinner /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-[var(--text-muted)]">No products found matching your criteria.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
