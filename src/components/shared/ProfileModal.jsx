import { useState, useContext, useEffect, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { db } from '../../services/db';
import { HiOutlineEye, HiOutlineEyeOff, HiX, HiOutlineMail, HiOutlinePhone, HiOutlineUser, HiOutlineLockClosed, HiPencil } from 'react-icons/hi';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobile: user.mobile || '',
        password: ''
      });
      setAvatarPreview(null);
      setIsEditing(false);
    }
  }, [user, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64Img = reader.result;
        setAvatarPreview(base64Img);

        await db.users.update(user.id, { avatar_url: base64Img });
        setUser({ ...user, avatar_url: base64Img });
        toast.success('Profile photo updated!');
      } catch (err) {
        toast.error('Failed to update photo');
        setAvatarPreview(null);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updates = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
      };
      if (formData.password) {
        updates.password = formData.password;
      }
      
      await db.users.update(user.id, updates);
      
      toast.success('Profile updated successfully');
      setUser({ ...user, ...updates });
      setFormData({ ...formData, password: '' });
      setIsEditing(false);
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (!isOpen || !user) return null;

  const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const displayAvatar = avatarPreview || user.avatar_url;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
        <div
          className="profile-modal-container relative w-full max-w-md glassmorphism rounded-2xl border border-[var(--border-color)] shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with gradient accent */}
          <div className="relative h-28 bg-gradient-to-br from-luxury-gold/30 via-luxury-gold/10 to-transparent overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(212,175,55,0.2),transparent_70%)]" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-full hover:bg-[var(--bg-card-hover)] cursor-pointer"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>

          {/* Avatar - overlapping header */}
          <div className="flex justify-center -mt-12">
            <div className="relative group">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover shadow-[0_0_30px_rgba(212,175,55,0.3)] border-4 border-[var(--bg-primary)] ring-2 ring-luxury-gold/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-luxury-gold to-luxury-gold-dark flex items-center justify-center text-3xl font-semibold text-black shadow-[0_0_30px_rgba(212,175,55,0.3)] border-4 border-[var(--bg-primary)] ring-2 ring-luxury-gold/20">
                  {userInitial}
                </div>
              )}

              {/* Pencil edit badge - top right corner */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-luxury-gold hover:bg-luxury-gold-dark flex items-center justify-center cursor-pointer transition-all duration-200 shadow-lg hover:scale-110 border-[3px] border-[var(--bg-primary)]"
                title="Change photo"
              >
                {uploading ? (
                  <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <HiPencil className="h-3.5 w-3.5 text-black" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* User Name & Role */}
          <div className="text-center mt-3 mb-1 px-6">
            <h2 className="text-xl font-medium text-[var(--text-primary)] tracking-wide">{user.name}</h2>
            <span className="inline-block mt-1 text-[10px] uppercase tracking-[0.2em] text-luxury-gold bg-luxury-gold/10 px-3 py-1 rounded-full border border-luxury-gold/20">
              {user.role || 'Customer'}
            </span>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-4">
            {!isEditing ? (
              /* View Mode */
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0">
                    <HiOutlineUser className="h-4 w-4 text-luxury-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Full Name</p>
                    <p className="text-sm text-[var(--text-primary)] truncate">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0">
                    <HiOutlineMail className="h-4 w-4 text-luxury-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Email</p>
                    <p className="text-sm text-[var(--text-primary)] truncate">{user.email || 'Not set'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                  <div className="w-9 h-9 rounded-lg bg-luxury-gold/10 flex items-center justify-center flex-shrink-0">
                    <HiOutlinePhone className="h-4 w-4 text-luxury-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Mobile</p>
                    <p className="text-sm text-[var(--text-primary)] truncate">{user.mobile || 'Not set'}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full mt-3 py-3 text-sm font-medium uppercase tracking-widest text-black bg-luxury-gold hover:bg-luxury-gold-dark transition-all duration-300 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>
            ) : (
              /* Edit Mode */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="appearance-none block w-full px-4 py-2.5 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold text-sm"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    className="appearance-none block w-full px-4 py-2.5 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold text-sm"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Mobile Number</label>
                  <input
                    name="mobile"
                    type="text"
                    required
                    className="appearance-none block w-full px-4 py-2.5 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold text-sm"
                    value={formData.mobile}
                    onChange={handleChange}
                  />
                </div>

                {/* Password Section */}
                <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                  <div className="flex items-center gap-2 mb-3">
                    <HiOutlineLockClosed className="h-4 w-4 text-luxury-gold" />
                    <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-widest">Change Password</span>
                  </div>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="appearance-none block w-full px-4 py-2.5 pr-10 border border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--input-text)] rounded-lg focus:outline-none focus:ring-1 focus:ring-luxury-gold text-sm"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Leave blank to keep current"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--text-muted)] hover:text-luxury-gold cursor-pointer"
                    >
                      {showPassword ? <HiOutlineEyeOff className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1.5 ml-1">Enter a new password to change it, or leave empty to keep your current one.</p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 text-sm font-medium uppercase tracking-widest text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] transition-colors duration-300 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 text-sm font-medium uppercase tracking-widest text-black bg-luxury-gold hover:bg-luxury-gold-dark transition-all duration-300 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.2)] cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .profile-modal-container {
          animation: profileModalSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes profileModalSlideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default ProfileModal;
