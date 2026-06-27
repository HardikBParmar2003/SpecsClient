import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  let allImages = [];
  if (product.image_gallery && Array.isArray(product.image_gallery)) {
    product.image_gallery.forEach(g => {
      if (g.images && Array.isArray(g.images)) {
        allImages = [...allImages, ...g.images.filter(i => i)];
      }
    });
  }
  if (allImages.length === 0 && product.image_url) {
    allImages = [product.image_url];
  }
  if (allImages.length === 0) {
    allImages = ['https://via.placeholder.com/500x375?text=No+Image'];
  }

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add items to cart", {
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }
      });
      navigate('/login');
      return;
    }

    try {
      await api.post('/cart', { product_id: product.id, quantity: 1 });
      toast.success(`${product.name} added to cart!`, {
        style: { background: 'var(--bg-card)', color: '#d4af37', border: '1px solid rgba(212, 175, 55, 0.3)' }
      });
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  const nextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden bg-[var(--bg-card)] backdrop-blur-md rounded-xl border border-[var(--border-color)] hover:border-luxury-gold/50 transition-all duration-500 shadow-[var(--shadow-card)]">
      <Link to={`/product/${product.id}`} className="block overflow-hidden relative">
        <div className="aspect-[4/3] bg-[var(--bg-primary)] relative">
          <img 
            key={currentImgIndex}
            src={allImages[currentImgIndex]} 
            alt={product.name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 animate-fade-in"
            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/500x375?text=No+Image'; }}
          />
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-[var(--bg-card)]/80 backdrop-blur-md text-[var(--text-primary)] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
              {product.brand}
            </span>
          </div>
          
          {/* Navigation Arrows */}
          {allImages.length > 1 && (
            <>
              <button 
                onClick={prevImg}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-[var(--bg-card)]/80 hover:bg-luxury-gold text-[var(--text-primary)] hover:text-black p-1.5 rounded-full backdrop-blur-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer shadow-md"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextImg}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--bg-card)]/80 hover:bg-luxury-gold text-[var(--text-primary)] hover:text-black p-1.5 rounded-full backdrop-blur-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 z-20 cursor-pointer shadow-md"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
              
              {/* Pagination Dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {allImages.map((_, idx) => (
                  <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImgIndex ? 'w-4 bg-luxury-gold' : 'w-1.5 bg-[var(--text-primary)]/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      </Link>
      
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-4">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-medium text-[var(--text-primary)] line-clamp-1 hover:text-luxury-gold transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{product.frame_type} • {product.shape}</p>
        </div>
        
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-[var(--text-primary)]/10">
          <p className="text-xl font-semibold text-luxury-gold">₹{product.price}</p>
          <button 
            onClick={handleAddToCart}
            className="bg-[var(--bg-card)] hover:bg-luxury-gold hover:text-black text-[var(--text-primary)] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform active:scale-95 cursor-pointer"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
