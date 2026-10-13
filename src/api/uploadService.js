import apiClient from './client.js';

export const uploadService = {
  /**
   * Upload multiple image files to backend / Cloudinary
   * @param {FormData} formData
   */
  async uploadImages(formData) {
    const res = await apiClient.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });
    return res.data?.images || [];
  },

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId) {
    const res = await apiClient.delete(`/upload/images/${encodeURIComponent(publicId)}`);
    return res.data;
  },
};
