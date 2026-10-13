import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { User, Mail, Phone, Lock, ArrowRight } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      success('Account created successfully! Welcome to D.MOST.HIGH.');
      navigate('/');
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.message || 'Unable to complete registration.';
      setErrorMessage(msg);
      toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-[#0A0A0A] py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-[#101010] border border-neutral-800 p-4 min-[380px]:p-6 sm:p-10 relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-[#FFE600]" />

        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1 mb-2 sm:mb-3">
            <span className="font-black text-xl min-[380px]:text-2xl tracking-tighter text-white">
              D.MOST.HIGH
            </span>
            <span className="w-2 h-2 rounded-full bg-[#FFE600] inline-block mb-1" />
          </Link>
          <h2 className="text-base sm:text-xl font-black uppercase tracking-widest text-white">
            CLIENT REGISTRATION
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Create an account for faster checkout and exclusive access
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Gold Adeleye"
                className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="client@dmosthigh.com"
                className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1">
              Password (Min. 6 Characters) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 text-base sm:text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl mt-4"
          >
            {loading ? 'CREATING ACCOUNT...' : 'JOIN D.MOST.HIGH'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-neutral-850 text-center text-xs text-neutral-400">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-[#FFE600] font-black uppercase tracking-wider hover:underline ml-1"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
