import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import { HiOutlineHome, HiOutlineUserGroup, HiOutlineViewGrid, HiOutlineBell, HiLogout, HiOutlineExternalLink, HiMenu, HiX, HiOutlineSun, HiOutlineMoon, HiOutlineShoppingBag } from 'react-icons/hi';

const AdminLayout = ({ children }) => {
  const { logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getLinkClasses = (path) => {
    const isActive = path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);
    return isActive 
      ? "flex items-center space-x-3 text-luxury-gold transition-colors p-2 rounded-md bg-luxury-gold/10 border border-luxury-gold/30 cursor-pointer"
      : "flex items-center space-x-3 text-[var(--text-secondary)] hover:text-luxury-gold transition-colors p-2 rounded-md hover:bg-[var(--bg-card-hover)] border border-transparent cursor-pointer";
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-[var(--bg-primary)]/80 backdrop-blur-sm z-40 md:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glassmorphism border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-10">
            <Link to="/" onClick={closeSidebar} className="text-xl font-light tracking-[0.2em] text-gradient uppercase block">Radheshyam</Link>
            <button className="md:hidden text-[var(--text-primary)] hover:text-luxury-gold cursor-pointer" onClick={closeSidebar}>
              <HiX className="w-6 h-6" />
            </button>
          </div>
          <nav className="space-y-4">
            <Link to="/admin" onClick={closeSidebar} className={getLinkClasses('/admin')}>
              <HiOutlineHome className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/pos" onClick={closeSidebar} className={getLinkClasses('/admin/pos')}>
              <HiOutlineViewGrid className="h-5 w-5" />
              <span>Walk-in POS</span>
            </Link>
            <Link to="/admin/products" onClick={closeSidebar} className={getLinkClasses('/admin/products')}>
              <HiOutlineViewGrid className="h-5 w-5" />
              <span>Inventory</span>
            </Link>
            <Link to="/admin/orders" onClick={closeSidebar} className={getLinkClasses('/admin/orders')}>
              <HiOutlineShoppingBag className="h-5 w-5" />
              <span>Orders</span>
            </Link>
            <Link to="/admin/customers" onClick={closeSidebar} className={getLinkClasses('/admin/customers')}>
              <HiOutlineUserGroup className="h-5 w-5" />
              <span>Customers</span>
            </Link>
            <Link to="/admin/reminders" onClick={closeSidebar} className={getLinkClasses('/admin/reminders')}>
              <HiOutlineBell className="h-5 w-5" />
              <span>Reminders</span>
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-[var(--border-color)] space-y-3">
          <button onClick={toggleTheme} className="flex items-center space-x-3 text-[var(--text-secondary)] hover:text-luxury-gold transition-colors w-full p-2 rounded-md hover:bg-[var(--bg-card-hover)] cursor-pointer">
            {theme === 'dark' ? <HiOutlineSun className="h-5 w-5" /> : <HiOutlineMoon className="h-5 w-5" />}
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <Link to="/" className="flex items-center space-x-3 text-[var(--text-secondary)] hover:text-luxury-gold transition-colors w-full p-2 rounded-md hover:bg-[var(--bg-card-hover)]">
            <HiOutlineExternalLink className="h-5 w-5" />
            <span>Back to Store</span>
          </Link>
          <button onClick={handleLogout} className="flex items-center space-x-3 text-[var(--text-muted)] hover:text-red-400 transition-colors w-full p-2 rounded-md hover:bg-[var(--bg-card-hover)]">
            <HiLogout className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto">
        <div className="md:hidden glassmorphism p-4 border-b border-[var(--border-color)] flex items-center gap-4 sticky top-0 z-30">
            <button onClick={() => setIsSidebarOpen(true)} className="text-[var(--text-primary)] hover:text-luxury-gold">
              <HiMenu className="w-6 h-6" />
            </button>
            <Link to="/admin" className="text-gradient tracking-widest uppercase text-lg">Admin Portal</Link>
        </div>
        <div className="p-6 md:p-10 pb-20">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
