import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-light tracking-[0.2em] text-gradient uppercase mb-6 animate-fade-in-up">
            Radheshyam
          </h1>
          <p className="text-lg md:text-2xl text-white/80 font-light tracking-widest mb-10 animate-fade-in-up animation-delay-200">
            PREMIUM EYEWEAR SINCE 1990
          </p>
          <div className="animate-fade-in-up animation-delay-400 flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/products" className="inline-block border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-[var(--bg-primary)] px-8 py-4 uppercase tracking-widest text-sm transition-all duration-300">
              Explore Collection
            </Link>
            {!user && (
              <Link to="/login" className="inline-block bg-luxury-gold text-[var(--bg-primary)] hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] px-8 py-4 uppercase tracking-widest text-sm transition-all duration-300 font-medium">
                Sign In / Join
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Brand Strip */}
      <section className="border-y border-white/5 bg-white/5 py-10 overflow-hidden">
        <div className="flex justify-around items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500 max-w-7xl mx-auto px-4">
           {['Ray-Ban', 'Oakley', 'Prada', 'Gucci', 'Silhouette'].map((brand, idx) => (
             <span key={idx} className="text-xl md:text-2xl font-bold tracking-wider uppercase text-white">{brand}</span>
           ))}
        </div>
      </section>

      {/* Our Story */}
      <section id="story" className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light tracking-[0.15em] uppercase mb-4">Our Story</h2>
          <div className="w-16 h-px bg-luxury-gold mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative overflow-hidden rounded-2xl h-80">
            {/* <img loading="lazy" layout="fill" class="gallpop_content_image " alt="" src="" style="height: 100%;"></img> */}
            <img 
              // src="https://images.unsplash.com/photo-1574258495973-f7977a85ee7e?w=800" 
              src="https://content.jdmagicbox.com/comp/bhavnagar/q3/0278px278.x278.100720095634.c9q3/catalogue/radheshyam-chasma-ghar-bhavnagar-jyarwbb7wd.jpg?imwidth=463.3333333333333" 
              alt="Our Heritage" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">Since 1990</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              What began as a humble optical shop has blossomed into a destination for discerning eyewear connoisseurs. 
              At Radheshyam Chashmaghar, we believe that the right pair of glasses isn't just an accessory — it's an expression of your personality.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              With over three decades of expertise, we've perfected the art of matching faces with frames. 
              From precision prescriptions to luxury brands, every detail is curated with care and craftsmanship.
            </p>
            <Link to="/products" className="inline-block border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-black px-6 py-3 uppercase tracking-widest text-sm transition-all duration-300">
              Explore Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Featured CTA */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-light tracking-[0.1em] uppercase mb-4">Curated Excellence</h2>
          <div className="w-16 h-px bg-luxury-gold mx-auto"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group overflow-hidden glassmorphism rounded-2xl h-96 flex items-end p-8">
            <img src="https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800" alt="Men's Collection" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="relative z-10 w-full">
              <h3 className="text-2xl tracking-widest uppercase mb-4 text-white">Men's Edit</h3>
              <Link to="/products?gender=Men" className="text-luxury-gold text-sm tracking-widest uppercase hover:text-white transition-colors flex items-center">
                Shop Now <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
          <div className="relative group overflow-hidden glassmorphism rounded-2xl h-96 flex items-end p-8">
            <img src="https://images.unsplash.com/photo-1508296695146-257a814070b4?w=800" alt="Women's Collection" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
            <div className="relative z-10 w-full">
              <h3 className="text-2xl tracking-widest uppercase mb-4 text-white">Women's Edit</h3>
              <Link to="/products?gender=Women" className="text-luxury-gold text-sm tracking-widest uppercase hover:text-white transition-colors flex items-center">
                Shop Now <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
