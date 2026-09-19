import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiOutlineSave, HiOutlineOfficeBuilding, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineDocumentText } from 'react-icons/hi';
import { shopConfig } from '../../config/shop';
import { db } from '../../services/db';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    shopName: '',
    phone_1: '',
    phone_2: '',
    address: '',
    terms: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const savedSettings = await db.settings.where({ key: 'shopSettings' }).first();
        if (savedSettings && savedSettings.value) {
          setSettings(savedSettings.value);
        } else {
          setSettings({
            shopName: shopConfig.shopName || '',
            phone_1: shopConfig.phone_1 || '',
            phone_2: shopConfig.phone_2 || '',
            address: shopConfig.address || '',
            terms: "E. & O. E.\nThanks. Visit Again."
          });
        }
      } catch (error) {
        console.error("Failed to load settings from db", error);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const existing = await db.settings.where({ key: 'shopSettings' }).first();
      if (existing) {
        await db.settings.update(existing.id, { value: settings });
      } else {
        await db.settings.add({ key: 'shopSettings', value: settings });
      }
      toast.success('Shop settings saved successfully!');
    } catch (err) {
      toast.error('Failed to save settings.');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-light tracking-widest uppercase text-luxury-gold">My Profile & Settings</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">Customize your shop details and invoice terms.</p>
      </div>

      <div className="glassmorphism rounded-xl border border-[var(--border-color)] p-6 space-y-6 shadow-[var(--shadow-card)]">
        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
            <HiOutlineOfficeBuilding className="w-4 h-4" /> Shop Name
          </label>
          <input 
            type="text" 
            name="shopName" 
            value={settings.shopName} 
            onChange={handleChange}
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors"
            placeholder="e.g. Custom Fits Tailor"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
              <HiOutlinePhone className="w-4 h-4" /> Mobile Number 1
            </label>
            <input 
              type="text" 
              name="phone_1" 
              value={settings.phone_1} 
              onChange={handleChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors"
              placeholder="Primary Phone"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
              <HiOutlinePhone className="w-4 h-4" /> Mobile Number 2
            </label>
            <input 
              type="text" 
              name="phone_2" 
              value={settings.phone_2} 
              onChange={handleChange}
              className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors"
              placeholder="Secondary Phone (Optional)"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
            <HiOutlineLocationMarker className="w-4 h-4" /> Shop Address
          </label>
          <textarea 
            name="address" 
            value={settings.address} 
            onChange={handleChange}
            rows="3"
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors resize-none"
            placeholder="Complete address for invoices"
          ></textarea>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
            <HiOutlineDocumentText className="w-4 h-4" /> Terms & Conditions
          </label>
          <textarea 
            name="terms" 
            value={settings.terms} 
            onChange={handleChange}
            rows="4"
            className="w-full bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-luxury-gold transition-colors resize-none"
            placeholder="e.g. No guaranty, pay money on time..."
          ></textarea>
          <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest">These terms will appear at the bottom of the generated PDF invoice.</p>
        </div>

        <div className="pt-4 border-t border-[var(--border-color)]">
          <button 
            onClick={handleSave}
            className="w-full sm:w-auto bg-luxury-gold text-black uppercase tracking-widest text-xs font-bold px-6 py-3 rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            <HiOutlineSave className="w-5 h-5" /> Save Profile Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
