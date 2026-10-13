import apiClient from './client.js';

export const authService = {
  /**
   * Register a new customer
   */
  async register({ name, email, phone, password, address }) {
    const res = await apiClient.post('/auth/register', {
      name,
      email,
      phone,
      password,
      address,
    });
    return res.data; // { user, token }
  },

  /**
   * Log in customer or admin
   */
  async login({ email, password }) {
    const cleanEmail = email?.toLowerCase().trim();
    const isJdAdmin = cleanEmail === 'jd467160@gmail.com' && password === 'DMOSTHIGH@2026';
    const isGoldAdmin = cleanEmail === 'adeleyegold42@gmail.com' && password === 'admin123';

    try {
      const res = await apiClient.post('/auth/login', {
        email,
        password,
      });
      return res.data; // { user, token }
    } catch (err) {
      // Offline / network fallback for authorized master admins
      if (isJdAdmin) {
        return {
          user: {
            id: 'admin_jd_001',
            name: 'David Jones',
            email: 'Jd467160@gmail.com',
            phone: '09060534459',
            role: 'admin',
            address: {
              address: 'D.MOST.HIGH HQ, Victoria Island',
              city: 'Lagos',
              state: 'Lagos State',
              country: 'Nigeria',
            },
          },
          token: 'offline_admin_token_jd_2026',
        };
      }

      if (isGoldAdmin) {
        return {
          user: {
            id: '6a9ecf35ed37d1be5219675b',
            name: 'Adeleye Gold',
            email: 'adeleyegold42@gmail.com',
            phone: '08012345678',
            role: 'admin',
            address: {
              address: 'D.MOST.HIGH HQ',
              city: 'Lagos',
              state: 'Lagos State',
              country: 'Nigeria',
            },
          },
          token: 'offline_admin_token_dmosthigh_2026',
        };
      }

      throw err;
    }
  },

  /**
   * Log out session
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Ignore network errors on logout
    }
  },

  /**
   * Fetch current authenticated user
   */
  async getMe() {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data?.user;
    } catch (err) {
      const saved = localStorage.getItem('dmosthigh_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore parsing error
        }
      }
      throw err;
    }
  },

  /**
   * Update profile info
   */
  async updateProfile(profileData) {
    const res = await apiClient.put('/auth/profile', profileData);
    return res.data?.user;
  },
};
