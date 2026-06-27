import { Link } from 'react-router-dom';
import { HiOutlineShoppingBag, HiMenu, HiX, HiOutlineSun, HiOutlineMoon, HiOutlineLogout, HiOutlineShieldCheck } from 'react-icons/hi';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';
import ProfileModal from '../shared/ProfileModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <>
      <nav className="sticky top-0 z-50 glassmorphism border-b border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0">
                <span className="text-2xl font-light tracking-[0.2em] text-gradient uppercase">Radheshyam</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <Link to="/products" className="text-[var(--text-primary)] hover:text-luxury-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">COLLECTION</Link>
                <a href="/#story" className="text-[var(--text-secondary)] hover:text-luxury-gold px-3 py-2 rounded-md text-sm font-medium transition-colors">OUR STORY</a>
                {user && user.role === 'admin' && (
                  <Link to="/admin" className="relative group overflow-hidden px-4 py-1.5 rounded-full text-xs font-bold tracking-[0.15em] text-[var(--bg-primary)] bg-gradient-to-r from-luxury-gold to-[#b38e28] hover:scale-105 transition-transform duration-300 shadow-[0_0_15px_rgba(212,175,55,0.4)] flex items-center">
                    <span className="relative z-10 flex items-center gap-1.5">
                      ADMIN PORTAL
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4 md:space-x-5">
              <button onClick={toggleTheme} className="hidden md:block text-[var(--text-primary)] hover:text-luxury-gold transition-colors cursor-pointer text-xs font-medium tracking-widest uppercase" aria-label="Toggle theme">
                {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
              </button>
              <Link to="/cart" className="text-[var(--text-primary)] hover:text-luxury-gold transition-colors relative">
                <HiOutlineShoppingBag className="h-6 w-6" />
              </Link>
              {user ? (
                <>
                  {/* Profile Avatar Button */}
                  <button
                    onClick={() => setIsProfileOpen(true)}
                    className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105 cursor-pointer ring-2 ring-luxury-gold/20"
                    aria-label="Open profile"
                    title={user.name}
                  >
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-full h-full bg-gradient-to-br from-luxury-gold to-luxury-gold-dark flex items-center justify-center text-sm font-semibold text-black">
                        {userInitial}
                      </span>
                    )}
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="hidden md:flex items-center gap-1.5 text-[var(--text-muted)] hover:text-red-400 transition-colors text-sm cursor-pointer group"
                    aria-label="Sign out"
                    title="Sign out"
                  >
                    <HiOutlineLogout className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium text-luxury-gold border border-luxury-gold/50 px-4 py-1.5 rounded-full hover:bg-luxury-gold/10 transition-colors">
                  SIGN IN
                </Link>
              )}
              <div className="flex md:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="text-[var(--text-primary)] hover:text-luxury-gold p-1 cursor-pointer">
                  {isOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden glassmorphism border-b border-[var(--border-color)]">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/products" className="text-[var(--text-primary)] hover:text-luxury-gold block px-3 py-2 rounded-md text-base font-medium">COLLECTION</Link>
              <a href="/#story" className="text-[var(--text-primary)] hover:text-luxury-gold block px-3 py-2 rounded-md text-base font-medium">OUR STORY</a>
              {user && user.role === 'admin' && (
                  <Link to="/admin" className="text-luxury-gold hover:text-luxury-gold-dark block px-3 py-2 rounded-md text-base font-bold tracking-widest transition-colors">
                    ADMIN PORTAL
                  </Link>
              )}
              <Link to="/cart" className="text-[var(--text-primary)] hover:text-luxury-gold block px-3 py-2 rounded-md text-base font-medium">CART</Link>
              <button onClick={toggleTheme} className="text-[var(--text-primary)] hover:text-luxury-gold block w-full text-left px-3 py-2 rounded-md text-base font-medium cursor-pointer">
                {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
              </button>
              {user ? (
                 <>
                   <button onClick={() => { setIsProfileOpen(true); setIsOpen(false); }} className="text-[var(--text-primary)] hover:text-luxury-gold block w-full text-left px-3 py-2 rounded-md text-base font-medium cursor-pointer">MY PROFILE</button>
                   <button onClick={logout} className="text-red-400 hover:text-red-300 block w-full text-left px-3 py-2 rounded-md text-base font-medium cursor-pointer">SIGN OUT</button>
                 </>
              ) : (
                 <Link to="/login" className="text-[var(--text-primary)] hover:text-luxury-gold block px-3 py-2 rounded-md text-base font-medium">SIGN IN</Link>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export default Navbar;
