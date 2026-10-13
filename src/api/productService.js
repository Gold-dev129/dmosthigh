import apiClient from './client.js';
import { INITIAL_PRODUCTS } from '../data/productsData.js';

const STORAGE_KEY = 'dmosthigh_local_products_v2';

const getStoredProducts = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...INITIAL_PRODUCTS];
};

const saveProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch {}
};

export const productService = {
  /**
   * Synchronous direct product catalog retrieval
   */
  getProductsSync(params = {}) {
    let list = getStoredProducts();

    if (params.category && params.category !== 'all') {
      list = list.filter((p) => p.category?.toLowerCase() === params.category.toLowerCase());
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    if (params.sort) {
      switch (params.sort) {
        case 'price-low':
          list.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
          break;
        case 'price-high':
          list.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
          break;
        case 'name-asc':
          list.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'newest':
        default:
          list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          break;
      }
    }

    return {
      products: list,
      pagination: { total: list.length, page: 1, pages: 1 },
    };
  },

  /**
   * Fetch active storefront products from backend API (with fallback)
   */
  async getProducts(params = {}) {
    try {
      const res = await apiClient.get('/products', { params });
      if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
        saveProducts(res.data);
        return {
          products: res.data,
          pagination: res.pagination || { total: res.data.length, page: 1, pages: 1 },
        };
      }
    } catch (err) {
      console.warn('Backend products fetch failed, using stored catalog:', err.message);
    }
    return this.getProductsSync(params);
  },

  /**
   * Fetch single product by ID (immediate local resolution)
   */
  getProductByIdSync(id) {
    const list = getStoredProducts();
    return list.find((p) => p._id === id || p.slug === id) || INITIAL_PRODUCTS[0];
  },

  /**
   * Fetch single product by ID from backend API
   */
  async getProductById(id) {
    try {
      const res = await apiClient.get(`/products/${id}`);
      if (res?.data?.product) {
        return res.data.product;
      }
    } catch (err) {
      console.warn('Backend product fetch failed, using stored product:', err.message);
    }
    return this.getProductByIdSync(id);
  },

  /**
   * Fetch single product by slug from backend API
   */
  async getProductBySlug(slug) {
    try {
      const res = await apiClient.get(`/products/slug/${slug}`);
      if (res?.data?.product) {
        return res.data.product;
      }
    } catch (err) {
      console.warn('Backend product by slug failed, using stored product:', err.message);
    }
    const list = getStoredProducts();
    return list.find((p) => p.slug === slug) || INITIAL_PRODUCTS[0];
  },

  /**
   * Admin: Create product via backend API
   */
  async createProduct(productData) {
    try {
      const res = await apiClient.post('/products', productData);
      if (res?.data?.product) {
        const list = getStoredProducts();
        list.unshift(res.data.product);
        saveProducts(list);
        return res.data.product;
      }
    } catch (err) {
      console.warn('Backend product creation failed, saving to local storage:', err.message);
    }

    const created = {
      ...productData,
      _id: 'dmh_prod_' + Date.now(),
      createdAt: new Date().toISOString(),
    };

    const list = getStoredProducts();
    list.unshift(created);
    saveProducts(list);
    return created;
  },

  /**
   * Admin: Update product via backend API
   */
  async updateProduct(id, productData) {
    try {
      const res = await apiClient.put(`/products/${id}`, productData);
      if (res?.data?.product) {
        const list = getStoredProducts();
        const idx = list.findIndex((p) => p._id === id);
        if (idx !== -1) {
          list[idx] = res.data.product;
          saveProducts(list);
        }
        return res.data.product;
      }
    } catch (err) {
      console.warn('Backend product update failed, updating locally:', err.message);
    }

    const list = getStoredProducts();
    const idx = list.findIndex((p) => p._id === id);
    let updated = null;
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...productData, updatedAt: new Date().toISOString() };
      saveProducts(list);
      updated = list[idx];
    } else {
      updated = { ...productData, _id: id };
    }
    return updated;
  },

  /**
   * Admin: Delete product via backend API
   */
  async deleteProduct(id) {
    try {
      await apiClient.delete(`/products/${id}`);
    } catch (err) {
      console.warn('Backend product deletion failed:', err.message);
    }

    const list = getStoredProducts().filter((p) => p._id !== id);
    saveProducts(list);
    return { success: true };
  },

  /**
   * Admin: Toggle active status
   */
  async updateProductStatus(id, active) {
    const list = getStoredProducts();
    const item = list.find((p) => p._id === id);
    if (item) {
      item.active = active;
      saveProducts(list);
    }
    apiClient.patch(`/products/${id}/status`, { active }).catch(() => {});
    return item || { _id: id, active };
  },

  /**
   * Admin: Update inventory stock
   */
  async updateProductStock(id, stock) {
    const list = getStoredProducts();
    const item = list.find((p) => p._id === id);
    if (item) {
      item.stock = stock;
      saveProducts(list);
    }
    apiClient.patch(`/products/${id}/stock`, { stock }).catch(() => {});
    return item || { _id: id, stock };
  },

  /**
   * Admin: Update discount
   */
  async updateProductDiscount(id, discountPrice) {
    const list = getStoredProducts();
    const item = list.find((p) => p._id === id);
    if (item) {
      item.discountPrice = discountPrice;
      saveProducts(list);
    }
    apiClient.patch(`/products/${id}/discount`, { discountPrice }).catch(() => {});
    return item || { _id: id, discountPrice };
  },
};

