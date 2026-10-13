import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { User, Mail, Phone, MapPin, Save, Shield, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AccountPage = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Nigeria',
    password: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address?.address || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        country: user.address?.country || 'Nigeria',
        password: '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: {
          address: formData.address.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim() || 'Nigeria',
        },
      };

      if (formData.password.trim()) {
        payload.password = formData.password.trim();
      }

      await updateProfile(payload);
      success('Profile details updated successfully!');
      setFormData((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-6 sm:py-12">
      <div className="max-w-4xl 2xl:max-w-5xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="border-b border-neutral-850 pb-5 sm:pb-6 mb-6 sm:mb-8 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#FFE600] block mb-1">
              CLIENT PROFILE
            </span>
            <h1 className="text-xl min-[380px]:text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              ACCOUNT SETTINGS
            </h1>
          </div>

          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            <Link
              to="/orders"
              className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-800 text-xs font-bold uppercase tracking-wider text-neutral-200 hover:text-white hover:border-[#FFE600] transition-colors"
            >
              <Package className="w-4 h-4 text-[#FFE600]" />
              Order History
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest hover:bg-yellow-400 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Profile Card Form */}
        <div className="bg-[#101010] border border-neutral-800 p-4 sm:p-8">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Account Role Tag */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-850">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#FFE600] text-black font-black text-lg flex items-center justify-center">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{user?.name}</h3>
                  <p className="text-xs text-neutral-400">{user?.email}</p>
                </div>
              </div>

              <span className="px-3 py-1 bg-neutral-900 border border-neutral-800 text-[10px] font-black uppercase tracking-widest text-[#FFE600]">
                {user?.role === 'admin' ? 'ADMINISTRATOR' : 'CUSTOMER'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Email (Read only) */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Email Address (Primary)
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full bg-neutral-950 border border-neutral-800 px-4 py-3 text-sm text-neutral-500 cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Password update optional */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* Address Header */}
              <div className="sm:col-span-2 pt-4 border-t border-neutral-850">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#FFE600] mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  DEFAULT SHIPPING DESTINATION
                </h4>
              </div>

              {/* Street Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Delivery address line"
                  className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Lagos, Ibadan, Abuja, etc."
                  className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                  State / Region
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Lagos State, Oyo State, etc."
                  className="w-full bg-neutral-900 border border-neutral-800 px-4 py-3 text-sm text-white focus:border-[#FFE600] focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-850 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'SAVING CHANGES...' : 'SAVE PROFILE'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
