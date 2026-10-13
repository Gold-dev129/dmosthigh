import apiClient from './client.js';

export const paymentService = {
  /**
   * Initialize Paystack payment for an order
   */
  async initializePayment({ orderId, orderNumber, callback_url }) {
    const res = await apiClient.post('/payment/initialize', {
      orderId,
      orderNumber,
      callback_url,
    });
    return res.data; // { authorization_url, access_code, reference }
  },

  /**
   * Verify Paystack payment transaction by reference
   */
  async verifyPayment(reference) {
    const res = await apiClient.get(`/payment/verify/${encodeURIComponent(reference)}`);
    return res.data; // { order, verified: true }
  },
};
