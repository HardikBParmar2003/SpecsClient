import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(emailOrMobile, password);
      if (res.success) {
        toast.success('Welcome back!');
        navigate('/');
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center bg-no-repeat bg-fixed relative">
      <div className="absolute inset-0 bg-[var(--bg-primary)]/70 backdrop-blur-sm"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10 glassmorphism p-10 rounded-2xl shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-light tracking-widest text-[var(--text-primary)] uppercase">Sign In</h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            Access your premium account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Email or Mobile <span className="text-red-500">*</span></label>
              <input
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-[var(--input-border)] bg-[var(--input-bg)] placeholder-[var(--input-placeholder)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold sm:text-sm transition-colors"
                placeholder="Enter email or mobile"
                value={emailOrMobile}
                onChange={(e) => setEmailOrMobile(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full px-4 py-3 pr-10 border border-[var(--input-border)] bg-[var(--input-bg)] placeholder-[var(--input-placeholder)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold sm:text-sm transition-colors"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-luxury-gold cursor-pointer z-10"
                >
                  {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-luxury-gold hover:text-[var(--text-primary)] transition-colors">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium uppercase tracking-widest text-black bg-luxury-gold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-luxury-gold focus:ring-offset-[var(--bg-primary)] transition-colors duration-300"
            >
              Sign In
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            New to Radheshyam?{' '}
            <Link to="/register" className="font-medium text-luxury-gold hover:text-[var(--text-primary)] transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
