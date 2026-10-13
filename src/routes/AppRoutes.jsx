import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Components
import { Navbar } from '../components/common/Navbar.jsx';
import { Footer } from '../components/common/Footer.jsx';
import { CartDrawer } from '../components/customer/CartDrawer.jsx';
import { AdminLayout } from '../components/admin/AdminLayout.jsx';

// Route Guards
import { CustomerRoute } from './CustomerRoute.jsx';
import { AdminRoute } from './AdminRoute.jsx';

// Customer Pages
import { HomePage } from '../pages/customer/HomePage.jsx';
import { ProductDetailPage } from '../pages/customer/ProductDetailPage.jsx';
import { CartPage } from '../pages/customer/CartPage.jsx';
import { CheckoutPage } from '../pages/customer/CheckoutPage.jsx';
import { OrderConfirmedPage } from '../pages/customer/OrderConfirmedPage.jsx';
import { OrdersPage } from '../pages/customer/OrdersPage.jsx';
import { OrderDetailPage } from '../pages/customer/OrderDetailPage.jsx';
import { AccountPage } from '../pages/customer/AccountPage.jsx';
import { LoginPage } from '../pages/customer/LoginPage.jsx';
import { RegisterPage } from '../pages/customer/RegisterPage.jsx';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage.jsx';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage.jsx';
import { AdminOrderDetailPage } from '../pages/admin/AdminOrderDetailPage.jsx';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage.jsx';
import { AdminProductFormPage } from '../pages/admin/AdminProductFormPage.jsx';

// Layout wrapper for customer storefront
const CustomerLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-[#0A0A0A]">
    <Navbar />
    <CartDrawer />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Customer Storefront Routes */}
      <Route
        path="/"
        element={
          <CustomerLayout>
            <HomePage />
          </CustomerLayout>
        }
      />
      <Route
        path="/product/:id"
        element={
          <CustomerLayout>
            <ProductDetailPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/cart"
        element={
          <CustomerLayout>
            <CartPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/checkout"
        element={
          <CustomerLayout>
            <CheckoutPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/order-confirmed"
        element={
          <CustomerLayout>
            <OrderConfirmedPage />
          </CustomerLayout>
        }
      />
      {/* Alias support for confirmation routes */}
      <Route
        path="/order/confirmation/:reference"
        element={
          <CustomerLayout>
            <OrderConfirmedPage />
          </CustomerLayout>
        }
      />

      <Route
        path="/login"
        element={
          <CustomerLayout>
            <LoginPage />
          </CustomerLayout>
        }
      />
      <Route
        path="/register"
        element={
          <CustomerLayout>
            <RegisterPage />
          </CustomerLayout>
        }
      />

      {/* Customer Protected Routes */}
      <Route
        path="/account"
        element={
          <CustomerRoute>
            <CustomerLayout>
              <AccountPage />
            </CustomerLayout>
          </CustomerRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <CustomerRoute>
            <CustomerLayout>
              <OrdersPage />
            </CustomerLayout>
          </CustomerRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <CustomerRoute>
            <CustomerLayout>
              <OrderDetailPage />
            </CustomerLayout>
          </CustomerRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="orders/:id" element={<AdminOrderDetailPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="products/new" element={<AdminProductFormPage />} />
        <Route path="products/:id/edit" element={<AdminProductFormPage />} />
      </Route>

      {/* 404 Catch-all */}
      <Route
        path="*"
        element={
          <CustomerLayout>
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4">
              <h1 className="text-7xl font-black text-[#FFE600] mb-2">404</h1>
              <h2 className="text-xl font-bold uppercase tracking-wider text-white mb-2">
                PAGE NOT FOUND
              </h2>
              <p className="text-xs text-neutral-400 mb-6 max-w-sm">
                The page you are searching for does not exist or has been relocated.
              </p>
              <a
                href="/"
                className="px-6 py-3 bg-[#FFE600] text-black font-black uppercase tracking-widest text-xs"
              >
                RETURN TO STOREFRONT
              </a>
            </div>
          </CustomerLayout>
        }
      />
    </Routes>
  );
};
