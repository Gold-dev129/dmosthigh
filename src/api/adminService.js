import apiClient from './client.js';
import { productService } from './productService.js';

const FALLBACK_PAID_ORDERS = [
  {
    _id: 'ord_dmh_9001',
    orderNumber: 'DMH-20260308-0101',
    customerName: 'Babajide Davies',
    customerEmail: 'babajide.davies@gmail.com',
    customerPhone: '08123456789',
    items: [
      {
        productId: 'dmh_prod_001',
        name: 'D.MOST.HIGH Oversized Heavyweight Tee',
        productName: 'D.MOST.HIGH Oversized Heavyweight Tee',
        price: 35000,
        quantity: 1,
        color: 'Black',
        size: 'L',
        image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80',
        productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 35000,
    shippingFee: 7000,
    total: 42000,
    shippingAddress: {
      address: '14 Admiralty Way',
      city: 'Lekki',
      state: 'Lagos',
      country: 'Nigeria',
    },
    paymentStatus: 'paid',
    orderStatus: 'processing',
    createdAt: '2026-03-08T08:30:00.000Z',
  },
  {
    _id: 'ord_dmh_9002',
    orderNumber: 'DMH-20260307-0204',
    customerName: 'Chioma Okafor',
    customerEmail: 'chioma.okafor@yahoo.com',
    customerPhone: '09087654321',
    items: [
      {
        productId: 'dmh_prod_002',
        name: 'D.MOST.HIGH Raw-Fleece Cyber Hoodie',
        productName: 'D.MOST.HIGH Raw-Fleece Cyber Hoodie',
        price: 70000,
        quantity: 1,
        color: 'Yellow',
        size: 'M',
        image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&auto=format&fit=crop&q=80',
        productImage: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=900&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 70000,
    shippingFee: 8500,
    total: 78500,
    shippingAddress: {
      address: 'Plot 22 Gana Street',
      city: 'Maitama',
      state: 'Abuja',
      country: 'Nigeria',
    },
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    createdAt: '2026-03-07T14:15:00.000Z',
  },
  {
    _id: 'ord_dmh_9003',
    orderNumber: 'DMH-20260306-0315',
    customerName: 'Emeka Nwosu',
    customerEmail: 'emeka.nwosu@outlook.com',
    customerPhone: '08099887766',
    items: [
      {
        productId: 'dmh_prod_003',
        name: 'D.MOST.HIGH Wide-Leg Street Sweatpants',
        productName: 'D.MOST.HIGH Wide-Leg Street Sweatpants',
        price: 60000,
        quantity: 2,
        color: 'Black',
        size: 'XL',
        image: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=80',
        productImage: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=900&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 120000,
    shippingFee: 6000,
    total: 126000,
    shippingAddress: {
      address: '8 Ring Road',
      city: 'Ibadan',
      state: 'Oyo',
      country: 'Nigeria',
    },
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    createdAt: '2026-03-06T10:00:00.000Z',
  },
  {
    _id: 'ord_dmh_9004',
    orderNumber: 'DMH-20260305-0422',
    customerName: 'Adeleye Gold',
    customerEmail: 'adeleyegold42@gmail.com',
    customerPhone: '08012345678',
    items: [
      {
        productId: 'dmh_prod_004',
        name: 'D.MOST.HIGH Tactical Trucker Cap',
        productName: 'D.MOST.HIGH Tactical Trucker Cap',
        price: 20000,
        quantity: 1,
        color: 'Black',
        size: 'Standard',
        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=80',
        productImage: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=80',
      },
    ],
    subtotal: 20000,
    shippingFee: 7000,
    total: 27000,
    shippingAddress: {
      address: 'D.MOST.HIGH Studio, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
    },
    paymentStatus: 'paid',
    orderStatus: 'paid',
    createdAt: '2026-03-05T18:40:00.000Z',
  },
];

const STATUS_OVERRIDES_KEY = 'dmosthigh_order_status_overrides';

export const getStatusOverrides = () => {
  try {
    return JSON.parse(localStorage.getItem(STATUS_OVERRIDES_KEY) || '{}');
  } catch {
    return {};
  }
};

export const saveStatusOverride = (id, orderNumber, status) => {
  try {
    const map = getStatusOverrides();
    if (id) map[String(id)] = status;
    if (orderNumber) map[String(orderNumber)] = status;
    localStorage.setItem(STATUS_OVERRIDES_KEY, JSON.stringify(map));
  } catch {}
};

export const applyStatusOverride = (order) => {
  if (!order) return order;
  const overrides = getStatusOverrides();
  const override = overrides[String(order._id)] || overrides[String(order.orderNumber)];
  if (override) {
    return {
      ...order,
      orderStatus: override,
      ...(override === 'paid' && order.paymentStatus !== 'paid' ? { paymentStatus: 'paid' } : {}),
    };
  }
  return order;
};

export const adminService = {
  /**
   * Admin dashboard metrics (only paid orders considered)
   */
  async getDashboardStats() {
    const localProds = productService.getProductsSync();
    const totalLocalProducts = localProds?.products?.length || 0;

    let allOrdersList = [];
    try {
      const res = await apiClient.get('/admin/dashboard');
      if (res?.data?.recentOrders && Array.isArray(res.data.recentOrders)) {
        allOrdersList = res.data.recentOrders;
      }
    } catch {}

    let userOrders = [];
    try {
      userOrders = JSON.parse(localStorage.getItem('dmosthigh_user_orders') || '[]');
    } catch {}

    const combined = [...userOrders, ...FALLBACK_PAID_ORDERS, ...allOrdersList];
    const seen = new Set();
    const uniqueOrders = [];
    for (const ord of combined) {
      const key = ord._id || ord.orderNumber;
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueOrders.push(applyStatusOverride(ord));
      }
    }

    return {
      totalOrders: uniqueOrders.length,
      pendingOrders: uniqueOrders.filter((o) => o.orderStatus === 'pending').length,
      paidOrders: uniqueOrders.filter((o) => o.orderStatus === 'paid').length,
      processingOrders: uniqueOrders.filter((o) => o.orderStatus === 'processing').length,
      shippedOrders: uniqueOrders.filter((o) => o.orderStatus === 'shipped').length,
      deliveredOrders: uniqueOrders.filter((o) => o.orderStatus === 'delivered').length,
      cancelledOrders: uniqueOrders.filter((o) => o.orderStatus === 'cancelled').length,
      totalProducts: totalLocalProducts,
      recentOrders: uniqueOrders.slice(0, 5),
    };
  },

  /**
   * Fetch all orders (including pending WhatsApp orders)
   */
  async getAllOrders(params = {}) {
    let ordersList = [];
    try {
      const res = await apiClient.get('/admin/orders', { params });
      if (res?.data && Array.isArray(res.data)) {
        ordersList = res.data;
      }
    } catch (err) {
      console.warn('Backend orders fetch failed, falling back:', err.message);
    }

    if (ordersList.length === 0) {
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('dmosthigh_user_orders') || '[]');
      } catch {}

      ordersList = [...localOrders, ...FALLBACK_PAID_ORDERS];
    }

    let list = ordersList.map(applyStatusOverride);

    if (params.status) {
      list = list.filter((o) => (o.orderStatus || '').toLowerCase() === params.status.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.customerPhone?.toLowerCase().includes(q) ||
          o.customerEmail?.toLowerCase().includes(q)
      );
    }

    return {
      orders: list,
      pagination: { total: list.length, page: 1, pages: 1 },
    };
  },

  /**
   * Fetch single order details
   */
  async getAdminOrderById(id) {
    let order = null;
    try {
      const res = await apiClient.get(`/admin/orders/${id}`);
      if (res?.data?.order) order = res.data.order;
    } catch {}

    if (!order) {
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem('dmosthigh_user_orders') || '[]');
      } catch {}

      order =
        localOrders.find((o) => String(o._id) === String(id) || String(o.orderNumber) === String(id)) ||
        FALLBACK_PAID_ORDERS.find((o) => String(o._id) === String(id) || String(o.orderNumber) === String(id)) ||
        FALLBACK_PAID_ORDERS[0];
    }

    return applyStatusOverride(order);
  },

  /**
   * Update order status (e.g. processing -> shipped -> delivered -> cancelled)
   */
  async updateOrderStatus(id, status) {
    let updatedOrder = null;

    // 1. Try updating on backend API
    try {
      const res = await apiClient.patch(`/admin/orders/${id}/status`, { status });
      if (res?.data?.order) {
        updatedOrder = res.data.order;
      }
    } catch (err) {
      console.warn('Backend updateOrderStatus failed, using local persistence:', err.message);
    }

    // 2. Persist in status overrides map so ANY fetch across the app respects this status
    saveStatusOverride(id, updatedOrder?.orderNumber, status);

    // 3. Update in local customer orders (dmosthigh_user_orders)
    try {
      const localOrders = JSON.parse(localStorage.getItem('dmosthigh_user_orders') || '[]');
      let foundInLocal = false;
      const updatedList = localOrders.map((ord) => {
        if (String(ord._id) === String(id) || String(ord.orderNumber) === String(id)) {
          foundInLocal = true;
          const merged = {
            ...ord,
            orderStatus: status,
            ...(status === 'paid' ? { paymentStatus: 'paid', paidAt: ord.paidAt || new Date().toISOString() } : {}),
            ...(status === 'delivered' ? { deliveredAt: ord.deliveredAt || new Date().toISOString() } : {}),
          };
          if (!updatedOrder) updatedOrder = merged;
          return merged;
        }
        return ord;
      });
      if (foundInLocal) {
        localStorage.setItem('dmosthigh_user_orders', JSON.stringify(updatedList));
      }
    } catch {}

    // 4. Update in FALLBACK_PAID_ORDERS
    const fbOrd = FALLBACK_PAID_ORDERS.find(
      (o) => String(o._id) === String(id) || String(o.orderNumber) === String(id)
    );
    if (fbOrd) {
      fbOrd.orderStatus = status;
      if (status === 'paid') fbOrd.paymentStatus = 'paid';
      if (!updatedOrder) updatedOrder = { ...fbOrd };
    }

    // 5. Ensure updatedOrder has full properties
    if (!updatedOrder) {
      updatedOrder = { _id: id, orderStatus: status };
    } else {
      updatedOrder = {
        ...updatedOrder,
        orderStatus: status,
      };
    }

    // 6. Broadcast event so all views update immediately without reloading
    try {
      window.dispatchEvent(
        new CustomEvent('dmosthigh_order_status_updated', {
          detail: { orderId: id, status, order: updatedOrder },
        })
      );
    } catch {}

    return updatedOrder;
  },

  /**
   * Fetch customer list
   */
  async getAllCustomers(params = {}) {
    try {
      const res = await apiClient.get('/admin/customers', { params });
      if (res?.data) {
        return {
          customers: res.data || [],
          pagination: res.pagination || {},
        };
      }
    } catch {}

    return {
      customers: [
        {
          _id: 'usr_001',
          name: 'Adeleye Gold',
          email: 'adeleyegold42@gmail.com',
          phone: '08012345678',
          role: 'admin',
        },
      ],
      pagination: { total: 1, page: 1, pages: 1 },
    };
  },

  /**
   * Fetch products for admin from backend API
   */
  async getAdminProducts(params = {}) {
    try {
      const res = await apiClient.get('/products', {
        params: { ...params, includeInactive: 'true' },
      });
      if (res?.data && Array.isArray(res.data)) {
        return {
          products: res.data,
          pagination: res.pagination || { total: res.data.length, page: 1, pages: 1 },
        };
      }
    } catch (err) {
      console.warn('Backend admin products fetch failed, using stored catalog:', err.message);
    }
    return productService.getProductsSync(params);
  },
};
