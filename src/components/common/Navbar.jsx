import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Shield, Package, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useCart } from '../../context/CartContext.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems, setIsDrawerOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'My Orders', path: '/orders' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-neutral-200 text-neutral-900">
      {/* Top Announcement Bar with Responsive Marquee & Wrap Protection */}
      <div className="bg-[#FFE600] text-black text-[10px] sm:text-[11px] font-black tracking-widest uppercase py-1.5 px-2 sm:px-4 text-center overflow-hidden shadow-sm">
        <div className="inline-flex items-center gap-2 truncate max-w-full">
          <span className="truncate">
            ⚡ D.MOST.HIGH // NATIONWIDE DELIVERY (1-2 WEEKS) • IBADAN (₦4,000) • OUTSIDE IBADAN (₦6,000)
          </span>
        </div>
      </div>

      <div className="max-w-7xl 2xl:max-w-[1700px] mx-auto px-2.5 min-[380px]:px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 min-[380px]:h-16 md:h-20">
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 min-[380px]:p-2 text-neutral-700 hover:text-yellow-600 focus:outline-none"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6" /> : <Menu className="w-5 h-5 min-[380px]:w-6 min-[380px]:h-6" />}
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-1 min-[380px]:gap-1.5 group">
              <span className="font-black text-lg min-[360px]:text-xl min-[400px]:text-2xl md:text-3xl tracking-tighter text-neutral-950 group-hover:text-yellow-600 transition-colors">
                D.MOST.HIGH
              </span>
              <span className="w-2 h-2 min-[380px]:w-2.5 min-[380px]:h-2.5 rounded-full bg-[#FFE600] inline-block mb-0.5 sm:mb-1 group-hover:scale-125 transition-transform shadow-sm" />
            </Link>
          </div>

          {/* Desktop Navigation (Clean Home & My Orders) */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs font-bold uppercase tracking-widest transition-colors ${
                  location.pathname === link.path
                    ? 'text-neutral-950 border-b-2 border-[#FFE600] pb-1'
                    : 'text-neutral-600 hover:text-yellow-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 md:space-x-5">
            {/* Search Button / Bar */}
            <div className="relative">
              {searchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="w-40 sm:w-56 bg-neutral-100 border border-neutral-300 focus:border-yellow-500 rounded px-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-yellow-400"
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="ml-1 text-neutral-500 hover:text-black"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-neutral-700 hover:text-yellow-600 transition-colors"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart Icon Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-neutral-700 hover:text-yellow-600 transition-colors relative"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-[#FFE600] text-black font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Account / Dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 py-1.5 px-2.5 rounded border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-semibold text-neutral-800"
                  >
                    <User className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="max-w-[80px] truncate hidden sm:inline">{user?.name?.split(' ')[0]}</span>
                    <ChevronDown className="w-3 h-3 text-neutral-500" />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-lg shadow-xl py-2 z-50 animate-fade-in">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-xs text-neutral-400">Signed in as</p>
                        <p className="text-xs font-bold text-neutral-900 truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-block mt-1 bg-[#FFE600]/30 text-neutral-950 border border-yellow-400 text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider rounded">
                            ADMIN
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-yellow-700 hover:bg-yellow-50 transition-colors uppercase tracking-wider"
                        >
                          <Shield className="w-4 h-4 text-yellow-600" />
                          Admin Dashboard
                        </Link>
                      )}

                      <Link
                        to="/account"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
                      >
                        <User className="w-4 h-4 text-neutral-400" />
                        Account Settings
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:text-black transition-colors"
                      >
                        <Package className="w-4 h-4 text-neutral-400" />
                        My Orders
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors border-t border-neutral-100 mt-1"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-yellow-600 px-2 py-1 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:inline-flex items-center justify-center bg-[#FFE600] text-black font-black uppercase tracking-widest text-[11px] px-3.5 py-1.5 rounded hover:bg-yellow-400 transition-all duration-150 shadow-sm"
                  >
                    Join
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-2 animate-fade-in">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-xs font-bold uppercase tracking-wider text-neutral-800 hover:text-yellow-600 py-2 border-b border-neutral-100"
            >
              {link.name}
            </Link>
          ))}

          {isAuthenticated ? (
            <div className="pt-2 space-y-1.5 border-t border-neutral-100">
              <div className="py-1 px-1">
                <span className="text-[10px] text-neutral-400 block uppercase">Client Profile</span>
                <span className="text-xs font-bold text-neutral-900 block truncate">{user?.name || user?.email}</span>
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 py-2 px-3 bg-[#FFE600] text-black text-xs font-black uppercase tracking-wider rounded shadow-sm"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </Link>
              )}

              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-xs font-semibold text-neutral-700 hover:text-black uppercase tracking-wider"
              >
                <User className="w-4 h-4 text-neutral-400" />
                Account Settings
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left flex items-center gap-2 py-2 text-xs font-semibold text-red-600 hover:text-red-700 uppercase tracking-wider"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 border border-neutral-300 rounded text-xs font-bold uppercase tracking-widest text-neutral-900 hover:bg-neutral-50"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-[#FFE600] text-black text-xs font-black uppercase tracking-widest rounded hover:bg-yellow-400 shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
