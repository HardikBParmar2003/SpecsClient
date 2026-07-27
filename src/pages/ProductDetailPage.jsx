import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { db } from '../services/db';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';
import PrescriptionForm from '../components/shared/PrescriptionForm';
import ProductCard from '../components/shared/ProductCard';
import VirtualTryOn from '../components/shared/VirtualTryOn';
import { HiOutlineCamera, HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showPrescription, setShowPrescription] = useState(false);
  const [prescription, setPrescription] = useState({});
  const [selectedColor, setSelectedColor] = useState('');
  const [mainImageIdx, setMainImageIdx] = useState(0);
  const [isVtoOpen, setIsVtoOpen] = useState(false);

  useEffect(() => {
    const fetchProductAndSimilar = async () => {
      setLoading(true);
      try {
        const p = await db.products.get(Number(id));
        if (p) {
          setProduct(p);
          
          // Determine colors from image_gallery JSON array of objects
          if (p.image_gallery && Array.isArray(p.image_gallery) && p.image_gallery.length > 0) {
            // New format: [{color: "Black", images: ["url"]}]
            if (p.image_gallery[0].color && p.image_gallery[0].images) {
              const colors = p.image_gallery.map(g => g.color).filter(c => c);
              if (colors.length > 0) setSelectedColor(colors[0]);
            }
          }

          // Fetch similar products based on brand
          const similarProductsData = await db.products.where({ brand: p.brand }).limit(4).toArray();
          setSimilarProducts(similarProductsData.filter(item => item.id !== p.id).slice(0, 3));
        } else {
          toast.error("Product not found");
        }
      } catch (error) {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndSimilar();
    window.scrollTo(0, 0);
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Please login to add items to cart", {
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)' }
      });
      navigate('/login');
      return;
    }
    
    try {
      const existingCartItem = await db.cart_items.where('[user_id+product_id]').equals([user.id, product.id]).first();
      
      if (existingCartItem) {
        await db.cart_items.update(existingCartItem.id, { quantity: existingCartItem.quantity + quantity });
      } else {
        await db.cart_items.add({
          user_id: user.id,
          product_id: product.id,
          quantity,
          created_at: new Date()
        });
      }
      toast.success(`${product.name} added to cart!`, {
        style: {
          background: 'var(--bg-card)',
          color: '#d4af37',
          border: '1px solid rgba(212, 175, 55, 0.3)',
        },
      });
    } catch (error) {
      toast.error("Failed to add to cart");
    }
  };

  if (loading) return <div className="py-32"><LoadingSpinner /></div>;
  if (!product) return <div className="py-32 text-center text-[var(--text-primary)]">Product not found.</div>;

  // Determine images array for the selected color
  let currentImages = [product.image_url];
  let availableColors = [];
  
  if (product.image_gallery && Array.isArray(product.image_gallery) && product.image_gallery.length > 0) {
    if (product.image_gallery[0].color && product.image_gallery[0].images) {
      // New format array of objects
      availableColors = product.image_gallery.map(g => g.color).filter(c => c);
      const selectedGallery = product.image_gallery.find(g => g.color === selectedColor);
      if (selectedGallery && selectedGallery.images && selectedGallery.images.length > 0) {
        currentImages = selectedGallery.images.filter(i => i);
      } else if (product.image_gallery[0].images && product.image_gallery[0].images.length > 0) {
        currentImages = product.image_gallery[0].images.filter(i => i);
      }
    } else {
      // Old format array of strings
      currentImages = product.image_gallery.filter(i => i);
    }
  }

  const mainImageUrl = currentImages[mainImageIdx] || currentImages[0] || product.image_url;

  const nextImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMainImageIdx((prev) => (prev + 1) % currentImages.length);
  };

  const prevImg = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMainImageIdx((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 mb-20">
        
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-[4/3] bg-[var(--bg-card)] rounded-2xl overflow-hidden border border-[var(--border-color)] relative glassmorphism group">
            <img key={mainImageIdx} src={mainImageUrl} alt={product.name} className="w-full h-full object-cover object-center animate-fade-in" />
            
            {/* Virtual Try On Button Overlay */}
            <div className="absolute inset-0 bg-[var(--bg-primary)]/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm z-10">
              <button 
                onClick={() => setIsVtoOpen(true)}
                className="bg-luxury-gold text-[var(--bg-primary)] px-6 py-3 rounded-full font-medium flex items-center gap-2 transform hover:scale-105 transition-all shadow-xl"
              >
                <HiOutlineCamera className="w-5 h-5" />
                Virtual Try-On
              </button>
            </div>

            {/* Navigation Arrows */}
            {currentImages.length > 1 && (
              <>
                <button 
                  onClick={prevImg}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-[var(--bg-card)]/80 hover:bg-luxury-gold text-[var(--text-primary)] hover:text-[var(--bg-primary)] p-2 sm:p-3 rounded-full backdrop-blur-md transition-all duration-300 z-20 cursor-pointer shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <HiOutlineChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-[var(--bg-card)]/80 hover:bg-luxury-gold text-[var(--text-primary)] hover:text-[var(--bg-primary)] p-2 sm:p-3 rounded-full backdrop-blur-md transition-all duration-300 z-20 cursor-pointer shadow-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <HiOutlineChevronRight className="w-6 h-6" />
                </button>
                
                {/* Pagination Dots for Mobile */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 sm:hidden">
                  {currentImages.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === mainImageIdx ? 'w-5 bg-luxury-gold' : 'w-2 bg-[var(--text-primary)]/40'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {currentImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {currentImages.map((img, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setMainImageIdx(idx)}
                  className={`aspect-[4/3] bg-[var(--bg-card)] rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${mainImageIdx === idx ? 'border-luxury-gold' : 'border-transparent hover:border-[var(--border-color)]'}`}
                >
                  <img src={img} alt={`${product.name} angle ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <div className="mb-2">
            <span className="text-sm tracking-[0.2em] uppercase text-luxury-gold font-medium">{product.brand}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light text-[var(--text-primary)] mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold text-luxury-gold mb-6">₹{product.price}</p>
          
          <div className="text-sm text-[var(--text-secondary)] leading-relaxed mb-8">
            <p>{product.description}</p>
          </div>

          {/* Dynamic Color Selector */}
          {availableColors.length > 0 && (
            <div className="mb-8">
               <span className="text-[var(--text-secondary)] block mb-3 text-sm tracking-widest uppercase">Select Color: <span className="text-[var(--text-primary)]">{selectedColor}</span></span>
               <div className="flex space-x-3">
                 {availableColors.map(color => {
                   let hex = '#111';
                   if (color === 'Gold') hex = '#d4af37';
                   if (color === 'Silver') hex = '#c0c0c0';
                   if (color === 'Tortoise') hex = 'radial-gradient(circle, #8a5a19 0%, #3e2723 100%)';
                   if (color === 'Blue') hex = '#000080';
                   if (color === 'Rose Gold') hex = '#b76e79';

                   return (
                    <button 
                       key={color} 
                       onClick={() => {
                         setSelectedColor(color);
                         setMainImageIdx(0); // Reset angle on color change
                       }}
                       className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-luxury-gold scale-110' : 'border-transparent border-[var(--border-color)] hover:border-[var(--border-hover)]'} transition-all`}
                       style={{ background: hex }}
                       title={color}
                     />
                   )
                 })}
               </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-sm p-6 glassmorphism rounded-xl">
            <div><span className="text-[var(--text-muted)] block mb-1">Frame Type</span><span className="text-[var(--text-primary)]">{product.frame_type}</span></div>
            <div><span className="text-[var(--text-muted)] block mb-1">Material</span><span className="text-[var(--text-primary)]">{product.material}</span></div>
            <div><span className="text-[var(--text-muted)] block mb-1">Shape</span><span className="text-[var(--text-primary)]">{product.shape}</span></div>
            <div><span className="text-[var(--text-muted)] block mb-1">Gender</span><span className="text-[var(--text-primary)]">{product.gender}</span></div>
          </div>

          <div className="border-t border-[var(--border-color)] pt-8 mb-8">
            <button 
              onClick={() => setShowPrescription(!showPrescription)}
              className="text-luxury-gold text-sm tracking-widest uppercase hover:text-[var(--text-primary)] transition-colors flex items-center mb-6"
            >
              {showPrescription ? '- Hide Prescription Form' : '+ Add Eye Prescription (Optional)'}
            </button>
            
            {showPrescription && (
              <div className="mb-8 animate-fade-in-up">
                <PrescriptionForm prescription={prescription} setPrescription={setPrescription} />
              </div>
            )}
          </div>

          <div className="flex space-x-4 mt-auto">
            <div className="flex items-center border border-[var(--border-color)] rounded-lg w-32 bg-[var(--bg-card)]">
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-12 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">-</button>
              <input type="text" readOnly value={quantity} className="w-full h-12 bg-transparent text-center text-[var(--text-primary)] focus:outline-none font-medium" />
              <button onClick={() => setQuantity(q => q + 1)} className="w-10 h-12 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-luxury-gold text-[var(--bg-primary)] rounded-lg uppercase tracking-widest text-sm font-semibold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] hover:scale-[1.02] transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Similar Products Section */}
      {similarProducts.length > 0 && (
        <div className="border-t border-[var(--border-color)] pt-16">
          <h2 className="text-2xl font-light text-[var(--text-primary)] mb-8 tracking-widest uppercase text-center">Similar Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Virtual Try On Modal */}
      <VirtualTryOn 
        isOpen={isVtoOpen} 
        onClose={() => setIsVtoOpen(false)} 
        productImg={mainImageUrl} 
      />
    </div>
  );
};

export default ProductDetailPage;
