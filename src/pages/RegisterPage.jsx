import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { shopConfig } from '../config/shop.js';
const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/register', formData);
      if (data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg-primary)]">
      <div className="max-w-md w-full space-y-8 glassmorphism p-10 rounded-2xl shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-light tracking-widest text-[var(--text-primary)] uppercase">Register</h2>
          <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
            Join the {shopConfig.shortName} exclusive club
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Full Name <span className="text-red-500">*</span></label>
              <input
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-[var(--input-border)] bg-[var(--input-bg)] placeholder-[var(--input-placeholder)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                className="appearance-none block w-full px-4 py-3 border border-[var(--input-border)] bg-[var(--input-bg)] placeholder-[var(--input-placeholder)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Mobile Number <span className="text-red-500">*</span></label>
              <input
                name="mobile"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-[var(--input-border)] bg-[var(--input-bg)] placeholder-[var(--input-placeholder)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold sm:text-sm"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Password <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full px-4 py-3 pr-10 border border-[var(--input-border)] bg-[var(--input-bg)] placeholder-[var(--input-placeholder)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold focus:border-luxury-gold sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
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

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium uppercase tracking-widest text-black bg-luxury-gold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] focus:outline-none transition-colors duration-300"
            >
              Create Account
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-luxury-gold hover:text-[var(--text-primary)] transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
