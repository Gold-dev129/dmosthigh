import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { LogIn, Lock, Mail, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const redirectPath = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      success(`Welcome back, ${loggedInUser.name || 'Client'}!`);

      // If user is admin, allow them into dashboard or where they were headed
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.message || 'Invalid email or password credentials.';
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
            CLIENT ACCESS
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 uppercase tracking-wider">
            Sign in to access your order history and account details
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 sm:p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold leading-relaxed">
            ⚠️ {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 sm:top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@dmosthigh.com"
                className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 sm:py-3 text-base sm:text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5 sm:top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 sm:py-3 text-base sm:text-xs text-white placeholder-neutral-600 focus:border-[#FFE600] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl"
          >
            {loading ? 'AUTHENTICATING...' : 'LOG IN TO ACCOUNT'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Register footer */}
        <div className="pt-4 border-t border-neutral-850 text-center text-xs text-neutral-400">
          <span>New to D.MOST.HIGH? </span>
          <Link
            to="/register"
            className="text-[#FFE600] font-black uppercase tracking-wider hover:underline ml-1"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
