import { shopConfig } from '../../config/shop.js';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-light tracking-[0.2em] text-gradient uppercase mb-6">{shopConfig.shortName}</h2>
            <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-sm">
              Crafting vision with elegance since 1990. Experience the pinnacle of eyewear luxury with our curated collection of premium frames and precision optics.
            </p>
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-medium tracking-widest text-sm uppercase mb-6">Explore</h3>
            <ul className="space-y-4">
              <li><a href="/products" className="text-[var(--text-secondary)] hover:text-luxury-gold transition-colors text-sm">Collection</a></li>
              <li><a href="#" className="text-[var(--text-secondary)] hover:text-luxury-gold transition-colors text-sm">Virtual Try-On</a></li>
              <li><a href="#" className="text-[var(--text-secondary)] hover:text-luxury-gold transition-colors text-sm">Store Locator</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-[var(--text-primary)] font-medium tracking-widest text-sm uppercase mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="text-[var(--text-secondary)] text-sm">{shopConfig.address}</li>
              <li className="text-[var(--text-secondary)] text-sm">{shopConfig.phone}</li>
              <li className="text-[var(--text-secondary)] text-sm">{shopConfig.email}</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-[var(--border-color)] flex flex-col md:flex-row justify-between items-center">
          <p className="text-[var(--text-faint)] text-xs">© {new Date().getFullYear()} {shopConfig.shopName}. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-[var(--text-faint)] hover:text-luxury-gold transition-colors">Instagram</a>
            <a href="#" className="text-[var(--text-faint)] hover:text-luxury-gold transition-colors">Facebook</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
