import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const ProfilePage = () => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        password: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/profile', formData);
      if (data.success) {
        toast.success('Profile updated successfully');
        setUser({ ...user, ...data.data }); // refresh user context
        setFormData({ ...formData, password: '' }); // clear password field
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  return (
    <div className="min-h-[70vh] max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-light tracking-widest text-[var(--text-primary)] uppercase mb-8 border-b border-[var(--border-color)] pb-4">My Profile</h1>
      
      <div className="glassmorphism p-8 rounded-2xl border border-[var(--border-color)] shadow-[var(--shadow-card)]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold sm:text-sm"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Email Address</label>
              <input
                name="email"
                type="email"
                className="appearance-none block w-full px-4 py-3 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold sm:text-sm"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">Mobile Number</label>
              <input
                name="mobile"
                type="text"
                required
                className="appearance-none block w-full px-4 py-3 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold sm:text-sm"
                value={formData.mobile}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-xs text-[var(--text-secondary)] uppercase tracking-widest mb-2">New Password (Optional)</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  className="appearance-none block w-full px-4 py-3 pr-10 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded focus:outline-none focus:ring-1 focus:ring-luxury-gold sm:text-sm"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep current"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-luxury-gold cursor-pointer"
                >
                  {showPassword ? <HiOutlineEyeOff className="h-5 w-5" /> : <HiOutlineEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3 border border-transparent text-sm font-medium uppercase tracking-widest text-black bg-luxury-gold hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)] cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
