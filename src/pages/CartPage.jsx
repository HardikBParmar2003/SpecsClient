import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { HiOutlineTrash } from 'react-icons/hi';
import { db } from '../services/db';
import { AuthContext } from '../context/AuthContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const CartPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    try {
      const items = await db.cart_items.where({ user_id: Number(user.id) }).toArray();
      // Join products manually
      const itemsWithProducts = await Promise.all(items.map(async (item) => {
        const product = await db.products.get(item.product_id);
        return { ...item, product };
      }));
      setCartItems(itemsWithProducts.filter(item => item.product));
    } catch (error) {
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (id, quantity) => {
    if (quantity < 1) return;
    try {
      await db.cart_items.update(id, { quantity });
      fetchCart();
    } catch (error) {
      toast.error("Failed to update quantity");
    }
  };

  const removeItem = async (id) => {
    try {
      await db.cart_items.delete(id);
      fetchCart();
      toast.success("Item removed");
    } catch (error) {
      toast.error("Failed to remove item");
    }
  };

  const handleCheckout = async () => {
    try {
      const totalCost = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
      
      const orderId = await db.orders.add({
        user_id: Number(user.id),
        ord_type: 'online',
        status: 'pending',
        frame_price: totalCost,
        glass_price: 0,
        discount: 0,
        total_price: totalCost,
        advance: 0,
        advance_online: 0,
        pay_status: 'pending',
        pay_method: 'card',
        reminder_months: 12,
        reminder_date: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        created_at: new Date(),
        updated_at: new Date()
      });

      for (const item of cartItems) {
        await db.order_items.add({
          order_id: orderId,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product.price,
          created_at: new Date()
        });
      }

      const cartIds = cartItems.map(item => item.id);
      await db.cart_items.bulkDelete(cartIds);

      toast.success("Order placed successfully!");
      setCartItems([]);
    } catch (error) {
      toast.error("Checkout failed");
    }
  };

  if (loading) return <div className="py-32"><LoadingSpinner /></div>;

  const total = cartItems.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-light tracking-widest uppercase border-b border-[var(--border-color)] text-[var(--text-primary)] pb-6 mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[var(--text-secondary)] mb-6 text-lg">Your cart is currently empty.</p>
          <Link to="/products" className="inline-block bg-luxury-gold text-black uppercase tracking-widest text-sm font-medium hover:bg-white transition-colors duration-300 px-8 py-3">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-6 p-4 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl">
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[var(--border-color)] rounded-lg overflow-hidden flex-shrink-0">
                  <img src={item.product.image_url} alt={item.product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg text-[var(--text-primary)] font-medium mb-1"><Link to={`/product/${item.product_id}`}>{item.product.name}</Link></h3>
                      <p className="text-sm text-[var(--text-secondary)] uppercase tracking-wider">{item.product.brand}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="text-[var(--text-muted)] hover:text-red-400 transition-colors p-2">
                      <HiOutlineTrash className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-auto flex justify-between items-end">
                    <div className="flex items-center border border-[var(--border-color)] rounded w-24">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-8 h-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">-</button>
                      <input type="text" readOnly value={item.quantity} className="w-full text-center text-[var(--text-primary)] bg-transparent text-sm focus:outline-none" />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-8 h-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">+</button>
                    </div>
                    <p className="text-lg font-medium text-luxury-gold">₹{(item.product.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--bg-card)] p-6 rounded-xl border border-[var(--border-color)] sticky top-28">
              <h2 className="text-lg font-medium tracking-widest uppercase mb-6 border-b border-[var(--border-color)] text-[var(--text-primary)] pb-4">Order Summary</h2>
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Subtotal</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Shipping</span>
                  <span>Complimentary</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>Estimated Tax</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>
              <div className="border-t border-[var(--border-color)] pt-4 mb-8">
                <div className="flex justify-between text-[var(--text-primary)] text-lg font-medium">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              <button 
                onClick={handleCheckout}
                className="w-full bg-luxury-gold text-black uppercase tracking-widest text-sm font-medium hover:bg-white transition-colors duration-300 py-4"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
