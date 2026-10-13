import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  PlusCircle,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Products Inventory', path: '/admin/products', icon: Package },
    { name: 'Add Product', path: '/admin/products/new', icon: PlusCircle },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row">
      {/* Mobile Admin Header */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-3.5 py-3 bg-[#101010] border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#FFE600]" />
          <span className="font-black tracking-wider text-xs uppercase">D.MOST.HIGH ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 text-neutral-400 hover:text-white"
          aria-label="Toggle admin navigation"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`${
          mobileOpen ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'
        } md:flex md:static w-72 md:w-64 bg-[#0D0D0D] border-r border-neutral-800 flex-shrink-0 flex-col justify-between transition-all duration-200`}
      >
        <div>
          {/* Logo / Admin Badge */}
          <div className="p-5 sm:p-6 border-b border-neutral-800">
            <Link to="/" className="flex items-center gap-1 mb-2">
              <span className="font-black text-xl tracking-tighter text-white">
                D.MOST.HIGH
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#FFE600]" />
            </Link>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFE600]/10 border border-[#FFE600]/30 text-[#FFE600] text-[10px] font-black uppercase tracking-widest">
              <Shield className="w-3 h-3" />
              ADMIN CONTROL PANEL
            </div>
            <p className="text-xs text-neutral-400 mt-2 truncate">
              {user?.name || user?.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 sm:p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === '/admin'
                  ? location.pathname === '/admin'
                  : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-bold uppercase tracking-wider rounded transition-colors ${
                    isActive
                      ? 'bg-[#FFE600] text-black shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-800 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-[#FFE600] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Storefront
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-neutral-850 rounded transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 p-3 min-[380px]:p-4 sm:p-6 lg:p-8 max-w-7xl 2xl:max-w-[1700px] w-full min-w-0 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};
